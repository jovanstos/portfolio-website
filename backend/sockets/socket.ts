import type { Server, Socket } from "socket.io";
import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import {
  ZIP_LIMITS,
  ZIP_PROTOCOL,
  type Ack,
  type Packet,
  type RoomInfo,
} from "../shared/zipline.js";

type Transfer = {
  id: string;
  sender: string;
  size: number;
  received: number;
  index: number;
  deadline: number;
};
type Room = {
  info: RoomInfo;
  host: string;
  devices: Set<string>;
  keySent: boolean;
  ready: boolean;
  created: number;
  last: number;
  transfer?: Transfer;
  busy: boolean;
};
type SocketData = { ip: string; room?: string };
const random = () => randomBytes(16).toString("hex");
const validKey = (v: unknown): v is string =>
  typeof v === "string" &&
  v.length >= 300 &&
  v.length <= 2048 &&
  /^[A-Za-z0-9+/=]+$/.test(v);
const equal = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
const binary = (v: unknown): v is Uint8Array =>
  Buffer.isBuffer(v) || v instanceof Uint8Array;
function encryptedBytes(packet: Packet): number {
  if (
    !packet.encrypted ||
    !binary(packet.encrypted.iv) ||
    packet.encrypted.iv.length !== 12 ||
    !binary(packet.encrypted.ciphertext)
  )
    throw new Error("Invalid encrypted envelope.");
  return packet.encrypted.ciphertext.length;
}

const DEFAULT_POLICY = {
  socketsPerIp: 6,
  waitingPerIp: 3,
  rooms: 100,
  sockets: 200,
  creationsPerMinute: 5,
  joinsPerMinute: 10,
  wrongAttempts: 5,
  waitingMs: 10 * 60_000,
  idleMs: 30 * 60_000,
  lifetimeMs: 2 * 60 * 60_000,
  byteWindow: 10 * 60_000,
  bytesPerWindow: ZIP_LIMITS.retained,
  transferMs: ZIP_LIMITS.transfer,
  ackMs: ZIP_LIMITS.ack,
};
export type ZipPolicy = { [Key in keyof typeof DEFAULT_POLICY]: number };
export const ZIP_POLICY: ZipPolicy = DEFAULT_POLICY;
export function initSockets(
  io: Server,
  options: {
    secret?: string;
    trustedHops?: number;
    policy?: Partial<typeof ZIP_POLICY>;
  } = {},
) {
  const policy = { ...ZIP_POLICY, ...options.policy };
  for (const value of Object.values(policy))
    if (!Number.isSafeInteger(value) || value <= 0)
      throw new Error("Zipline limits must be positive integers.");
  const rooms = new Map<string, Room>();
  const codes = new Map<string, string>();
  const counters = new Map<string, { value: number; expires: number }>();
  const metrics: Record<string, number> = {};
  const fail = (code: string, message: string): Ack => {
    metrics[code] = (metrics[code] ?? 0) + 1;
    return { ok: false, code, message };
  };
  const charge = (key: string, limit: number, window: number, value = 1) => {
    const now = Date.now();
    let entry = counters.get(key);
    if (!entry || entry.expires <= now) {
      entry = { value: 0, expires: now + window };
      counters.set(key, entry);
    }
    if (entry.value + value > limit)
      throw new Error("Rate limit reached. Please try again later.");
    entry.value += value;
  };
  function destroy(roomID: string, reason: string) {
    const room = rooms.get(roomID);
    if (!room) return;
    rooms.delete(roomID);
    codes.delete(room.info.code);
    for (const id of room.devices) {
      const peer = io.sockets.sockets.get(id);
      if (peer) {
        peer.leave(roomID);
        (peer.data as SocketData).room = undefined;
        peer.emit("zip:closed", { message: reason });
      }
    }
  }
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of counters)
      if (value.expires <= now) counters.delete(key);
    for (const [id, room] of rooms) {
      if (
        (!room.ready && room.info.expiresAt <= now) ||
        now - room.last >= policy.idleMs ||
        now - room.created >= policy.lifetimeMs
      )
        destroy(id, "Session expired. Pair again to continue.");
      else if (room.transfer && room.transfer.deadline <= now) {
        room.transfer = undefined;
        io.to(id).emit("zip:abort", { message: "Transfer timed out." });
      }
    }
  }, 1000);
  timer.unref();
  io.engine.on("close", () => {
    clearInterval(timer);
    rooms.clear();
    codes.clear();
    counters.clear();
  });
  io.use((socket, next) => {
    try {
      const token = /(?:^|;\s*)auth_token=([^;]+)/.exec(
        socket.handshake.headers.cookie ?? "",
      )?.[1];
      jwt.verify(
        token ? decodeURIComponent(token) : "",
        options.secret ?? process.env.JWT_SECRET ?? "dev",
      );
      let ip = socket.handshake.address;
      if (options.trustedHops) {
        const chain = String(socket.handshake.headers["x-forwarded-for"] ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        ip = chain[Math.max(0, chain.length - options.trustedHops)] ?? ip;
      }
      if (io.sockets.sockets.size >= policy.sockets)
        return next(new Error("Zipline is busy."));
      const peers = [...io.sockets.sockets.values()].filter(
        (s) => (s.data as SocketData).ip === ip,
      );
      if (peers.length >= policy.socketsPerIp)
        return next(new Error("Connection limit reached."));
      socket.data = { ip } satisfies SocketData;
      next();
    } catch {
      next(new Error("Session expired. Reload to connect."));
    }
  });
  io.on("connection", (socket: Socket) => {
    const data = socket.data as SocketData;
    // The v1 protocol is intentionally retired, not silently accepted.
    for (const event of [
      "room:create",
      "room:join",
      "session:key",
      "msg:encrypted",
      "file:init",
      "file:chunk",
      "file:complete",
    ])
      socket.on(event, () =>
        socket.emit("room:error-message", {
          message: "Zipline was updated. Please refresh both devices.",
        }),
      );
    socket.on("zip:request", async (input: unknown, callback: unknown) => {
      if (typeof callback !== "function") return;
      const reply = callback as (result: Ack) => void;
      if (!input || typeof input !== "object")
        return reply(fail("INVALID", "Invalid request."));
      const request = input as Record<string, unknown>;
      if (request.protocol !== ZIP_PROTOCOL)
        return reply(fail("VERSION", "Please refresh both devices."));
      try {
        charge(`events:${socket.id}`, 600, 60_000);
        if (request.action === "leave") {
          if (data.room)
            destroy(data.room, "A device left. Pair again to continue.");
          return reply({ ok: true, data: null });
        }
        if (request.action === "create" || request.action === "join") {
          if (data.room) throw new Error("Leave the current session first.");
          if (!validKey(request.publicKey))
            throw new Error("Invalid public key.");
          if (request.action === "create") {
            charge(`create:${data.ip}`, policy.creationsPerMinute, 60_000);
            if (rooms.size >= policy.rooms)
              throw new Error("Zipline is busy. Please try later.");
            const waiting = [...rooms.values()].filter(
              (r) =>
                !r.ready &&
                (io.sockets.sockets.get(r.host)?.data as SocketData | undefined)
                  ?.ip === data.ip,
            );
            if (waiting.length >= policy.waitingPerIp)
              throw new Error("Too many waiting sessions.");
            let code: string;
            const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
            do {
              code = Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join('');
            } while (codes.has(code));
            const info = {
              roomID: random(),
              secret: random(),
              code,
              expiresAt: Date.now() + policy.waitingMs,
            };
            rooms.set(info.roomID, {
              info,
              host: socket.id,
              devices: new Set([socket.id]),
              keySent: false,
              ready: false,
              created: Date.now(),
              last: Date.now(),
              busy: false,
            });
            codes.set(code, info.roomID);
            data.room = info.roomID;
            socket.data.publicKey = request.publicKey;
            await socket.join(info.roomID);
            return reply({ ok: true, data: info });
          }
          charge(`join:${data.ip}`, policy.joinsPerMinute, 60_000);
          const invitation = request.invitation as
            Record<string, unknown> | undefined;
          if (!invitation || typeof invitation !== "object")
            throw new Error("Invalid invitation.");
          const code =
            typeof invitation.code === "string"
              ? invitation.code.toUpperCase().replace(/\s/g, "")
              : "";
          const id = code ? codes.get(code) : invitation.roomID;
          const room = typeof id === "string" ? rooms.get(id) : undefined;
          const attemptKey = `incorrect:${data.ip}:${code.slice(0, 8) || String(id).slice(0, 32)}`;
          const attempts = counters.get(attemptKey);
          if (
            attempts &&
            attempts.expires > Date.now() &&
            attempts.value >= policy.wrongAttempts
          )
            throw new Error("Pairing cooldown. Try again in ten minutes.");
          const valid =
            room &&
            room.info.expiresAt > Date.now() &&
            (code
              ? code === room.info.code
              : typeof invitation.secret === "string" &&
                equal(invitation.secret, room.info.secret));
          if (!valid) {
            charge(attemptKey, policy.wrongAttempts, policy.byteWindow);
            throw new Error("Invitation is invalid or expired.");
          }
          if (room.devices.size !== 1)
            throw new Error("This session already has two devices.");
          room.devices.add(socket.id);
          data.room = room.info.roomID;
          socket.data.publicKey = request.publicKey;
          await socket.join(room.info.roomID);
          reply({ ok: true, data: { roomID: room.info.roomID } });
          socket.emit("zip:peer", {
            host: false,
            publicKey: io.sockets.sockets.get(room.host)?.data.publicKey,
          });
          io.to(room.host).emit("zip:peer", {
            host: true,
            publicKey: request.publicKey,
          });
          return;
        }
        if (request.action !== "packet") throw new Error("Unknown action.");
        const room = data.room ? rooms.get(data.room) : undefined;
        if (!room || !room.devices.has(socket.id) || room.devices.size !== 2)
          throw new Error("Pair a second device first.");
        if (room.busy) throw new Error("A delivery is already in progress.");
        const packet = request.packet as Packet;
        if (
          !packet ||
          typeof packet.id !== "string" ||
          !/^[a-zA-Z0-9-]{1,64}$/.test(packet.id)
        )
          throw new Error("Invalid packet.");
        const receiver = [...room.devices].find((id) => id !== socket.id)!;
        const bytes =
          packet.kind === "key" || packet.kind === "abort"
            ? 0
            : encryptedBytes(packet);
        if (packet.kind === "key") {
          if (
            socket.id !== room.host ||
            room.ready ||
            room.keySent ||
            typeof packet.wrappedKey !== "string" ||
            packet.wrappedKey.length > 512
          )
            throw new Error("Invalid key exchange.");
          room.keySent = true;
        } else if (packet.kind === "confirm") {
          if (
            socket.id === room.host ||
            !room.keySent ||
            room.ready ||
            bytes > 256
          )
            throw new Error("Invalid key confirmation.");
        } else {
          if (!room.ready) throw new Error("The connection is not secure yet.");
          if (packet.kind === "text") {
            if (bytes > ZIP_LIMITS.text + 16)
              throw new Error("Text is too large.");
            charge(`text:${socket.id}`, 30, 60_000);
          } else if (packet.kind === "init") {
            if (room.transfer)
              throw new Error("Wait for the current file transfer.");
            if (
              !Number.isSafeInteger(packet.size) ||
              packet.size! < 0 ||
              packet.size! > ZIP_LIMITS.file ||
              bytes > 4096
            )
              throw new Error("File must be at most 5 MiB.");
            charge(
              `bytes:${socket.id}`,
              policy.bytesPerWindow,
              policy.byteWindow,
              packet.size,
            );
            charge(
              `bytes-ip:${data.ip}`,
              policy.bytesPerWindow,
              policy.byteWindow,
              packet.size,
            );
            room.transfer = {
              id: packet.id,
              sender: socket.id,
              size: packet.size!,
              received: 0,
              index: 0,
              deadline: Date.now() + policy.transferMs,
            };
          } else if (
            packet.kind === "chunk" ||
            packet.kind === "complete" ||
            packet.kind === "abort"
          ) {
            const transfer = room.transfer;
            if (
              !transfer ||
              transfer.id !== packet.id ||
              transfer.sender !== socket.id ||
              transfer.deadline <= Date.now()
            )
              throw new Error("No active transfer.");
            if (packet.kind === "chunk") {
              const expected = Math.min(
                ZIP_LIMITS.chunk,
                transfer.size - transfer.received,
              );
              if (
                expected <= 0 ||
                packet.index !== transfer.index ||
                bytes !== expected + 16
              )
                throw new Error("Invalid chunk sequence or size.");
              transfer.received += expected;
              transfer.index++;
            } else if (
              packet.kind === "complete" &&
              (transfer.received !== transfer.size || bytes > 256)
            )
              throw new Error("File is incomplete.");
          } else throw new Error("Invalid packet kind.");
        }
        room.busy = true;
        try {
          const response = (await io
            .to(receiver)
            .timeout(policy.ackMs)
            .emitWithAck("zip:packet", packet)) as Ack[];
          if (!rooms.has(room.info.roomID))
            throw new Error("Session interrupted.");
          if (!response[0]?.ok)
            throw new Error(
              response[0] && !response[0].ok
                ? response[0].message
                : "Receiver did not confirm delivery.",
            );
          room.last = Date.now();
          if (packet.kind === "key") io.to(receiver).emit("zip:keyAccepted");
          if (packet.kind === "confirm") {
            room.ready = true;
            io.to(room.info.roomID).emit("zip:ready");
          }
          if (packet.kind === "complete" || packet.kind === "abort")
            room.transfer = undefined;
          reply({ ok: true, data: null });
        } catch {
          if (packet.kind === "key" || packet.kind === "confirm")
            destroy(room.info.roomID, "Key exchange failed. Pair again.");
          else if (room.transfer) {
            room.transfer = undefined;
            io.to(room.info.roomID).emit("zip:abort", {
              message: "Delivery interrupted. The file was not confirmed.",
            });
          }
          reply(
            fail(
              "UNCONFIRMED",
              "Delivery was not confirmed. Check the receiving device.",
            ),
          );
        } finally {
          room.busy = false;
        }
      } catch (error) {
        reply(
          fail(
            "REJECTED",
            error instanceof Error ? error.message : "Request rejected.",
          ),
        );
      }
    });
    socket.on("disconnect", () => {
      if (data.room)
        destroy(
          data.room,
          "The other device disconnected. Pair again to continue.",
        );
    });
  });
  return { metrics, roomCount: () => rooms.size };
}
