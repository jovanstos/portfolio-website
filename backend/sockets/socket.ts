import { Server, Socket } from "socket.io";
import crypto from "crypto";

type DeviceInfo = {
    socketId: string;
    publicKey: string; // sent from client
    approved: boolean;
};

type RoomState = {
    pairingCode: string;
    devices: Map<string, DeviceInfo>;
};

const rooms = new Map<string, RoomState>();

export function initSockets(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("room:create", ({ roomID, publicKey }) => {
            let room = rooms.get(roomID);

            if (!room) {
                room = {
                    pairingCode: generatePairingCode(),
                    devices: new Map()
                };
                rooms.set(roomID, room);

                room.devices.set(socket.id, {
                    socketId: socket.id,
                    publicKey,
                    approved: room.devices.size === 0 // first device auto-approved
                });

                socket.join(roomID);

                socket.emit("room:pairing-code", {
                    pairingCode: room.pairingCode,
                    approved: room.devices.get(socket.id)?.approved
                });

            } else {
                console.log("room already exists set this up to send message");
            }


        });

        socket.on("room:join", ({ roomID, publicKey, pairingCode }) => {
            const room = rooms.get(roomID);

            if (!room) return;

            if (room.pairingCode !== pairingCode) {
                socket.emit("room:approval-failed");
                return;
            }

            room.devices.set(socket.id, {
                socketId: socket.id,
                publicKey,
                approved: true
            });

            socket.join(roomID);

            socket.emit("room:approved");
        });

        socket.on("room:approve", ({ roomID, pairingCode }) => {
            console.log("APPROVE HIT", roomID, pairingCode);

            const room = rooms.get(roomID);
            if (!room) return;

            if (room.pairingCode !== pairingCode) {
                socket.emit("room:approval-failed");
                return;
            }

            const device = room.devices.get(socket.id);
            if (device) {
                console.log("ALLOWED");

                device.approved = true;
                socket.emit("room:approved");
            }
        });

        socket.on("msg:encrypted", ({ roomID, payload }) => {
            console.log(roomID, payload);

            relayToRoom(socket, roomID, "msg:encrypted",
                payload);
        });

        socket.on("file:init", ({ roomID, meta }) => {
            relayToRoom(socket, roomID, "file:init", meta);
        });

        socket.on("file:chunk", ({ roomID, chunk }) => {
            relayToRoom(socket, roomID, "file:chunk", chunk);
        });

        socket.on("file:complete", ({ roomID }) => {
            relayToRoom(socket, roomID, "file:complete", null);
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
    payload: any
) {
    const room = rooms.get(roomID);
    if (!room) return;

    const sender = room.devices.get(socket.id);
    if (!sender?.approved) return;

    socket.to(roomID).emit(event, {
        from: socket.id,
        payload
    });
}

function generatePairingCode(): string {
    return crypto.randomBytes(3).toString("hex"); // e.g. "a3f92c"
}

function cleanupSocket(socketId: string) {
    for (const [roomID, room] of rooms) {
        room.devices.delete(socketId);
        if (room.devices.size === 0) {
            rooms.delete(roomID);
        }
    }
}
