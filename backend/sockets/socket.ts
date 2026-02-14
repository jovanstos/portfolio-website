import { Server, Socket } from "socket.io";
import { RoomState } from "../types/socketTypes.js";
import crypto from "crypto";

const rooms = new Map<string, RoomState>();

// 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function emitErrorMessage(socket: Socket, message: string) {
  socket.emit("room:error-message", { message });
}

/* 
    This comment may be seen as a mistake since the script as first glance may look complex
    but this code is very self documenting it has clear names for the functions and what it is doing
    just reading any part you can clearly tell what the socket is addressing
*/
export function initSockets(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on("room:create", ({ roomID, publicKey }) => {
      if (!roomID || roomID.trim() === "") {
        emitErrorMessage(
          socket,
          "ID must be at least two characters or numbers",
        );
        return;
      }

      let room = rooms.get(roomID);

      if (!room) {
        room = {
          pairingCode: generatePairingCode(),
          devices: new Map(),
          transfers: new Map(),
        };
        rooms.set(roomID, room);

        room.devices.set(socket.id, {
          socketId: socket.id,
          publicKey,
          approved: room.devices.size === 0,
        });

        socket.join(roomID);

        socket.emit("room:pairing-code", {
          pairingCode: room.pairingCode,
          approved: room.devices.get(socket.id)?.approved,
        });
      } else {
        emitErrorMessage(socket, "ID already exists try a diffrent ID");
      }
    });

    socket.on("room:join", ({ roomID, publicKey, pairingCode }) => {
      const room = rooms.get(roomID);

      if (!room) {
        emitErrorMessage(socket, "ID entered was not found");
        return;
      }
      if (room.pairingCode !== pairingCode) {
        emitErrorMessage(socket, "Incorrect pairing code please try again");
        return;
      }
      if (room.devices.size >= 2) {
        emitErrorMessage(
          socket,
          "This session has already been paired and the maximum of 2 devices has been reached",
        );
        return;
      }

      room.devices.set(socket.id, {
        socketId: socket.id,
        publicKey,
        approved: true,
      });

      socket.join(roomID);

      for (const [id, device] of room.devices) {
        if (id !== socket.id) {
          socket.emit("peer:public-key", {
            socketId: id,
            publicKey: device.publicKey,
          });

          socket.to(id).emit("peer:public-key", {
            socketId: socket.id,
            publicKey,
          });
        }
      }

      socket.emit("room:approved");
    });

    socket.on("session:key", ({ roomID, payload }) => {
      const room = rooms.get(roomID);

      if (!room) {
        emitErrorMessage(socket, "ID entered was not found");
        return;
      }

      for (const [id] of room.devices) {
        if (id !== socket.id) {
          socket.emit("session:key", {
            payload: payload,
          });

          socket.to(id).emit("session:key", {
            payload: payload,
          });
        }
      }
    });

    socket.on("msg:encrypted", ({ roomID, payload }) => {
      relayToRoom(socket, roomID, "msg:encrypted", payload);
    });

    socket.on("file:init", ({ roomID, meta }) => {
      const room = rooms.get(roomID);

      if (!room) {
        emitErrorMessage(socket, "ID entered was not found");
        return;
      }

      if (meta?.size > MAX_FILE_SIZE) {
        emitErrorMessage(socket, "File exceeds 5MB limit");
        return;
      }

      room.transfers!.set(socket.id, {
        bytesReceived: 0,
        active: true,
      });

      socket.to(roomID).emit("file:init", { meta });
    });

    socket.on("file:chunk", ({ roomID, payload }) => {
      const room = rooms.get(roomID);

      if (!room) {
        emitErrorMessage(socket, "ID entered was not found");
        return;
      }

      const transfer = room.transfers?.get(socket.id);

      if (!transfer || !transfer.active) {
        emitErrorMessage(
          socket,
          "No active file transfer or file exceeds 5MB limit",
        );
        return;
      }

      const payloadJson = JSON.stringify(payload);

      const chunkSize = payload
        ? payload.length
        : Buffer.byteLength(payloadJson, "utf8");

      transfer.bytesReceived += chunkSize;

      if (transfer.bytesReceived > MAX_FILE_SIZE) {
        transfer.active = false;
        room.transfers!.delete(socket.id);

        emitErrorMessage(socket, "File upload exceeded 5MB limit");

        socket.to(roomID).emit("file:abort");
        return;
      }

      socket.to(roomID).emit("file:chunk", { payload });
    });

    socket.on("file:complete", ({ roomID }) => {
      const room = rooms.get(roomID);

      if (!room) {
        emitErrorMessage(socket, "ID entered was not found");
        return;
      }

      room.transfers?.delete(socket.id);
      socket.to(roomID).emit("file:complete");
    });

    socket.on("leave", () => {
      cleanupSocket(socket.id);
    });

    socket.on("disconnect", () => {
      cleanupSocket(socket.id);
    });
  });
}

function relayToRoom(
  socket: Socket,
  roomID: string,
  event: string,
  payload: any,
) {
  const room = rooms.get(roomID);

  if (!room) {
    emitErrorMessage(socket, "ID entered was not found");
    return;
  }

  const sender = room.devices.get(socket.id);
  if (!sender?.approved) {
    emitErrorMessage(
      socket,
      "You are not approved to send messages in this session",
    );
    return;
  }

  socket.to(roomID).emit(event, { from: socket.id, payload });
}

function generatePairingCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function cleanupSocket(socketId: string) {
  for (const [roomID, room] of rooms) {
    room.devices.delete(socketId);
    room.transfers?.delete(socketId);

    if (room.devices.size === 0) rooms.delete(roomID);
  }
}
