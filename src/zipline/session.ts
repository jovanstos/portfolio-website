import type { Socket } from "socket.io-client";
import { api } from "../api/client";
import { createSocket } from "./socket";
import {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  generateAESKey,
  wrapKey,
  unwrapKey,
  aesEncrypt,
  aesDecrypt,
  digest,
} from "./crypto";
import {
  ZIP_LIMITS,
  ZIP_PROTOCOL,
  context,
  type ZipRequest,
  type Ack,
  type Packet,
  type ZipState,
  type RoomInfo,
  type JoinInput,
  type PeerInfo,
  type FileMeta,
  type ZipMessage,
} from "../../backend/shared/zipline";
export interface ZipSnapshot {
  state: ZipState;
  room?: RoomInfo;
  messages: ZipMessage[];
  error: string;
  busy: boolean;
  progress?: number;
  direction?: "sending" | "receiving";
}
const encode = (text: string) => new TextEncoder().encode(text);
const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes);
export class ZipSession {
  private snapshot: ZipSnapshot = {
    state: "connecting",
    messages: [],
    error: "",
    busy: false,
  };
  private listeners = new Set<() => void>();
  private socket?: Socket;
  private bootstrap?: AbortController;
  private generation = 0;
  private keys?: CryptoKeyPair;
  private aes?: CryptoKey;
  private roomID = "";
  private incoming?: {
    id: string;
    meta: FileMeta;
    chunks: Uint8Array[];
    size: number;
    index: number;
  };
  private cancelled = false;
  private confirmation = "";
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getSnapshot = () => this.snapshot;
  private update(change: Partial<ZipSnapshot>) {
    this.snapshot = { ...this.snapshot, ...change };
    this.listeners.forEach((fn) => fn());
  }
  private append(message: ZipMessage) {
    let messages = [
      ...this.snapshot.messages.filter((m) => m.id !== message.id),
      message,
    ].slice(-100);
    let retained = messages.reduce((n, m) => n + (m.blob?.size ?? 0), 0);
    messages = messages.map((m) => {
      if (retained > ZIP_LIMITS.retained && m.blob) {
        retained -= m.blob.size;
        return { ...m, blob: undefined, expired: true };
      }
      return m;
    });
    this.update({ messages });
  }
  private status(id: string, status: ZipMessage["status"]) {
    this.update({
      messages: this.snapshot.messages.map((m) =>
        m.id === id ? { ...m, status } : m,
      ),
    });
  }
  private async request<T = unknown>(request: ZipRequest): Promise<T> {
    if (!this.socket?.connected)
      throw new Error("Connection interrupted. Pair again.");
    const generation = this.generation;
    const response = (await this.socket
      .timeout(ZIP_LIMITS.ack + 1000)
      .emitWithAck("zip:request", request)) as Ack<T>;
    if (generation !== this.generation) throw new Error("Session changed.");
    if (!response?.ok)
      throw new Error(
        response && !response.ok
          ? `${response.code}: ${response.message}`
          : "Delivery was not confirmed.",
      );
    return response.data;
  }
  private sendPacket(packet: Packet, generation = this.generation) {
    if (generation !== this.generation)
      return Promise.reject(new Error("Session changed."));
    return this.request({ protocol: ZIP_PROTOCOL, action: "packet", packet });
  }
  dispose() {
    this.generation++;
    this.bootstrap?.abort();
    this.bootstrap = undefined;
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = undefined;
    this.keys = undefined;
    this.aes = undefined;
    this.incoming = undefined;
    this.cancelled = true;
    this.snapshot = { ...this.snapshot, messages: [], room: undefined, busy: false, progress: undefined, direction: undefined };
  }
  close() {
    this.dispose();
    this.update({
      state: "closed",
      room: undefined,
      messages: [],
      busy: false,
      progress: undefined,
    });
  }
  async start(invitation?: JoinInput) {
    this.dispose();
    const generation = this.generation;
    this.cancelled = false;
    this.update({
      state: "connecting",
      messages: [],
      room: undefined,
      error: "",
      busy: false,
      progress: undefined,
    });
    try {
      if (!crypto.subtle)
        throw new Error(
          "Zipline requires HTTPS and a browser supporting Web Crypto.",
        );
      this.bootstrap = new AbortController();
      await api.get("/session", { signal: this.bootstrap.signal });
      if (generation !== this.generation) return;
      const keys = await generateKeyPair();
      if (generation !== this.generation) return;
      this.keys = keys;
      const socket = createSocket();
      this.socket = socket;
      socket.on("disconnect", () => {
        if (generation === this.generation) {
          this.aes = undefined;
          this.keys = undefined;
          this.incoming = undefined;
          this.update({
            state: 'interrupted',
            messages: [],
            busy: false,
            progress: undefined,
            room: undefined,
            error:
              this.snapshot.error || "Disconnected. Pair again to continue.",
          });
        }
      });
      socket.on("zip:closed", ({ message }: { message: string }) => {
        if (generation === this.generation) {
          this.aes = undefined;
          this.keys = undefined;
          this.incoming = undefined;
          this.update({
            state: 'interrupted',
            messages: [],
            room: undefined,
            busy: false,
            progress: undefined,
            error: message,
          });
        }
      });
      socket.on("zip:abort", ({ message }: { message: string }) => {
        this.cancelled = true;
        this.incoming = undefined;
        this.update({ busy: false, progress: undefined, error: message });
      });
      socket.on("zip:ready", () => {
        if (generation === this.generation)
          this.update({ state: "connected", error: "", room: undefined });
      });
      socket.on("zip:peer", async ({ host, publicKey }: PeerInfo) => {
        try {
          this.update({ state: "securing" });
          if (host) {
            const peer = await importPublicKey(publicKey);
            const aes = await generateAESKey();
            const wrappedKey = await wrapKey(aes, peer);
            if (generation !== this.generation) return;
            this.aes = aes;
            await this.sendPacket(
              { kind: "key", id: crypto.randomUUID(), wrappedKey },
              generation,
            );
          }
        } catch (error) {
          if (generation === this.generation) {
            this.update({ error: String(error), state: "interrupted" });
            this.socket?.disconnect();
          }
        }
      });
      socket.on("zip:keyAccepted", async () => {
        try {
          if (!this.aes) throw new Error("Key exchange failed.");
          const packet: Packet = { kind: "confirm", id: this.confirmation };
          packet.encrypted = await aesEncrypt(
            encode(`ready:${this.roomID}`),
            this.aes,
            context(packet),
          );
          await this.sendPacket(packet, generation);
        } catch (error) {
          if (generation === this.generation)
            this.update({ state: "interrupted", error: String(error) });
        }
      });
      socket.on(
        "zip:packet",
        async (packet: Packet, reply: (ack: Ack) => void) => {
          try {
            await this.receive(packet, generation);
            if (generation === this.generation) reply({ ok: true, data: null });
          } catch {
            if (generation === this.generation) {
              this.incoming = undefined;
              this.update({
                error: "Unable to authenticate or assemble incoming data.",
                busy: false,
                progress: undefined,
              });
            }
            reply({
              ok: false,
              code: "INVALID",
              message: "Receiver rejected the data.",
            });
          }
        },
      );
      await new Promise<void>((resolve, reject) => {
        const timer = globalThis.setTimeout(() => {
          cleanup();
          reject(new Error("Connection timed out. Please try again."));
        }, ZIP_LIMITS.ack);
        function cleanup() {
          clearTimeout(timer);
          socket.off("connect", connected);
          socket.off("connect_error", failed);
        }
        function connected() {
          cleanup();
          resolve();
        }
        function failed(error: Error) {
          cleanup();
          reject(error);
        }
        socket.once("connect", connected);
        socket.once("connect_error", failed);
        socket.connect();
      });
      if (generation !== this.generation) return;
      const publicKey = await exportPublicKey(this.keys.publicKey);
      if (invitation) {
        this.update({ state: "joining" });
        const result = await this.request<{ roomID: string }>({
          protocol: ZIP_PROTOCOL,
          action: "join",
          publicKey,
          invitation,
        });
        this.roomID = result.roomID;
      } else {
        const info = await this.request<RoomInfo>({
          protocol: ZIP_PROTOCOL,
          action: "create",
          publicKey,
        });
        this.roomID = info.roomID;
        this.update({ state: "hosting", room: info });
      }
    } catch (error) {
      if (generation === this.generation) {
        this.update({
          state: "interrupted",
          error: error instanceof Error ? error.message : "Unable to pair.",
        });
        this.socket?.disconnect();
      }
    }
  }
  private async receive(packet: Packet, generation: number) {
    if (packet.kind === "key") {
      if (!this.keys || !packet.wrappedKey || this.aes)
        throw new Error("Invalid key.");
      const key = await unwrapKey(packet.wrappedKey, this.keys.privateKey);
      if (generation !== this.generation) throw new Error("Session changed.");
      this.aes = key;
      this.confirmation = crypto.randomUUID();
      return;
    }
    if (packet.kind === "abort") {
      this.incoming = undefined;
      this.update({
        busy: false,
        progress: undefined,
        error: "The sender cancelled the transfer.",
      });
      return;
    }
    if (!this.aes || !packet.encrypted) throw new Error("No session key.");
    const bytes = await aesDecrypt(packet.encrypted, this.aes, context(packet));
    if (generation !== this.generation) throw new Error("Session changed.");
    if (packet.kind === "confirm") {
      if (decode(bytes) !== `ready:${this.roomID}`)
        throw new Error("Wrong session.");
      return;
    }
    if (packet.kind === "text") {
      if (bytes.length > ZIP_LIMITS.text) throw new Error("Text too large.");
      if (!this.snapshot.messages.some((m) => m.id === packet.id))
        this.append({
          id: packet.id,
          from: "other",
          text: decode(bytes),
          status: "delivered",
        });
    } else if (packet.kind === "init") {
      const meta = JSON.parse(decode(bytes)) as FileMeta;
      if (
        typeof meta.name !== "string" ||
        meta.name.length > 255 ||
        typeof meta.type !== "string" ||
        meta.type.length > 100 ||
        typeof meta.digest !== "string" ||
        !/^[a-f0-9]{64}$/.test(meta.digest) ||
        meta.size !== packet.size ||
        !Number.isSafeInteger(meta.size) ||
        meta.size < 0 ||
        meta.size > ZIP_LIMITS.file
      )
        throw new Error("Invalid file metadata.");
      this.incoming = { id: packet.id, meta, chunks: [], size: 0, index: 0 };
      this.update({ busy: true, progress: 0, direction: "receiving" });
    } else {
      const transfer = this.incoming;
      if (!transfer || transfer.id !== packet.id)
        throw new Error("No transfer.");
      if (packet.kind === "chunk") {
        if (
          packet.index !== transfer.index ||
          bytes.length !==
            Math.min(ZIP_LIMITS.chunk, transfer.meta.size - transfer.size)
        )
          throw new Error("Wrong chunk.");
        transfer.chunks.push(bytes);
        transfer.size += bytes.length;
        transfer.index++;
        this.update({
          progress: transfer.meta.size ? transfer.size / transfer.meta.size : 1,
        });
      } else if (packet.kind === "complete") {
        if (transfer.size !== transfer.meta.size)
          throw new Error("Incomplete file.");
        const blob = new Blob(
          transfer.chunks.map((chunk) => new Uint8Array(chunk).buffer),
          { type: transfer.meta.type },
        );
        if (
          (await digest(new Uint8Array(await blob.arrayBuffer()))) !==
            transfer.meta.digest ||
          generation !== this.generation
        )
          throw new Error("File integrity check failed.");
        this.append({
          id: packet.id,
          from: "other",
          name: transfer.meta.name,
          blob,
          status: "delivered",
        });
        this.incoming = undefined;
        this.update({ busy: false, progress: undefined });
      } else throw new Error("Unknown packet.");
    }
  }
  async sendText(text: string) {
    if (
      this.snapshot.state !== "connected" ||
      this.snapshot.busy ||
      !this.aes ||
      !text.trim()
    )
      return;
    const bytes = encode(text);
    if (bytes.length > ZIP_LIMITS.text) {
      this.update({ error: "Text must be at most 16 KiB." });
      return;
    }
    const id = crypto.randomUUID();
    const generation = this.generation;
    this.append({ id, from: "self", text, status: "pending" });
    this.update({ busy: true, error: "" });
    try {
      const packet: Packet = { kind: "text", id };
      packet.encrypted = await aesEncrypt(bytes, this.aes, context(packet));
      await this.sendPacket(packet, generation);
      if (generation === this.generation) this.status(id, "delivered");
    } catch (error) {
      if (generation === this.generation) {
        this.status(
          id,
          String(error).includes("REJECTED") ? "failed" : "unconfirmed",
        );
        this.update({ error: String(error) });
      }
    } finally {
      if (generation === this.generation) this.update({ busy: false });
    }
  }
  cancel() {
    this.cancelled = true;
  }
  async sendFile(file: File) {
    if (this.snapshot.state !== "connected" || this.snapshot.busy || !this.aes)
      return;
    if (file.size > ZIP_LIMITS.file) {
      this.update({ error: "File must be at most 5 MiB (5,242,880 bytes)." });
      return;
    }
    const generation = this.generation;
    const id = crypto.randomUUID();
    const key = this.aes;
    this.cancelled = false;
    this.update({ busy: true, progress: 0, direction: "sending", error: "" });
    this.append({ id, from: "self", name: file.name, status: "pending" });
    try {
      const meta: FileMeta = {
        name: file.name,
        type: file.type,
        size: file.size,
        digest: await digest(new Uint8Array(await file.arrayBuffer())),
      };
      const init: Packet = { kind: "init", id, size: file.size };
      init.encrypted = await aesEncrypt(
        encode(JSON.stringify(meta)),
        key,
        context(init),
      );
      await this.sendPacket(init, generation);
      for (
        let offset = 0, index = 0;
        offset < file.size;
        offset += ZIP_LIMITS.chunk, index++
      ) {
        if (this.cancelled || generation !== this.generation)
          throw new Error("Transfer cancelled.");
        const packet: Packet = { kind: "chunk", id, index };
        packet.encrypted = await aesEncrypt(
          new Uint8Array(
            await file.slice(offset, offset + ZIP_LIMITS.chunk).arrayBuffer(),
          ),
          key,
          context(packet),
        );
        await this.sendPacket(packet, generation);
        if (generation === this.generation)
          this.update({
            progress: Math.min(1, (offset + ZIP_LIMITS.chunk) / file.size),
          });
      }
      if (this.cancelled || generation !== this.generation)
        throw new Error("Transfer cancelled.");
      const complete: Packet = { kind: "complete", id };
      complete.encrypted = await aesEncrypt(
        encode("complete"),
        key,
        context(complete),
      );
      await this.sendPacket(complete, generation);
      if (generation === this.generation)
        this.append({
          id,
          from: "self",
          name: file.name,
          blob: file,
          status: "delivered",
        });
    } catch (error) {
      if (generation === this.generation) {
        this.status(
          id,
          this.cancelled || String(error).includes("REJECTED")
            ? "failed"
            : "unconfirmed",
        );
        this.update({ error: String(error) });
        await this.sendPacket({ kind: "abort", id }).catch(() => undefined);
      }
    } finally {
      if (generation === this.generation)
        this.update({ busy: false, progress: undefined, direction: undefined });
    }
  }
}
export function readInvitation(
  location: Pick<Location, "hash" | "search">,
): JoinInput | undefined {
  const params = new URLSearchParams(location.hash.slice(1) || location.search);
  const roomID = params.get("roomID");
  const secret = params.get("secret") ?? params.get("pairingCode");
  return roomID && secret ? { roomID, secret } : undefined;
}
export function pairingLink(room: RoomInfo) {
  return `${window.location.origin}/zipline#${new URLSearchParams({ roomID: room.roomID, secret: room.secret })}`;
}
