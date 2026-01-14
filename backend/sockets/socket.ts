import { Server, Socket } from "socket.io";
import { RoomState } from "../types/socketTypes.js";
import crypto from "crypto";

const rooms = new Map<string, RoomState>();

export function initSockets(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("room:create", ({ roomID, publicKey }) => {
            let room = rooms.get(roomID);

            if (!room) {
                room = { pairingCode: generatePairingCode(), devices: new Map() };
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
                console.log("update me to send errors");
            }
        });

        socket.on("room:join", ({ roomID, publicKey, pairingCode }) => {
            const room = rooms.get(roomID);

            console.log("update me to send errors");

            if (!room) return;
            if (room.pairingCode !== pairingCode) return;
            if (room.devices.size >= 2) return;

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

            console.log("update me to send errors");
            if (!room) return;

            for (const [id] of room.devices) {
                if (id !== socket.id) {

                    socket.emit("session:key", {
                        payload: payload
                    });

                    socket.to(id).emit("session:key", {
                        payload: payload
                    });
                }
            }
        });

        socket.on("msg:encrypted", ({ roomID, payload }) => {
            relayToRoom(socket, roomID, "msg:encrypted", payload);
        });

        socket.on("file:init", ({ roomID, meta }) => {
            const room = rooms.get(roomID);
            if (!room) return;

            socket.to(roomID).emit("file:init", { meta });
        });

        socket.on("file:chunk", ({ roomID, payload }) => {
            const room = rooms.get(roomID);
            if (!room) return;

            socket.to(roomID).emit("file:chunk", { payload });
        });

        socket.on("file:complete", ({ roomID }) => {
            const room = rooms.get(roomID);
            if (!room) return;

            socket.to(roomID).emit("file:complete");
        });

        socket.on("disconnect", () => {
            cleanupSocket(socket.id);
        });
    });
}

function relayToRoom(socket: Socket, roomID: string, event: string, payload: any) {
    const room = rooms.get(roomID);
    if (!room) return;

    const sender = room.devices.get(socket.id);
    if (!sender?.approved) return;

    socket.to(roomID).emit(event, { from: socket.id, payload });
}

function generatePairingCode(): string {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function cleanupSocket(socketId: string) {
    for (const [roomID, room] of rooms) {
        room.devices.delete(socketId);
        if (room.devices.size === 0) rooms.delete(roomID);
    }
}
