export const ZIP_PROTOCOL = 2;
export const ZIP_LIMITS = { file: 5 * 1024 * 1024, chunk: 64 * 1024, text: 16 * 1024, ack: 10_000, transfer: 120_000, retained: 20 * 1024 * 1024 } as const;
export type Ack<T = unknown> = { ok: true; data: T } | { ok: false; code: string; message: string };
export type Envelope = { iv: Uint8Array; ciphertext: Uint8Array };
export type Packet = { kind: 'key' | 'confirm' | 'text' | 'init' | 'chunk' | 'complete' | 'abort'; id: string; index?: number; size?: number; wrappedKey?: string; encrypted?: Envelope };
export type RoomInfo = { roomID: string; secret: string; code: string; expiresAt: number };
export type JoinInput = { code: string } | { roomID: string; secret: string };
export type ZipRequest = { protocol: number; action: 'create'; publicKey: string } | { protocol: number; action: 'join'; publicKey: string; invitation: JoinInput } | { protocol: number; action: 'leave' } | { protocol: number; action: 'packet'; packet: Packet };
export type ZipState = 'connecting' | 'hosting' | 'joining' | 'securing' | 'connected' | 'interrupted' | 'closed';
export type PeerInfo = { publicKey: string; host: boolean };
export type FileMeta = { name: string; type: string; size: number; digest: string };
export type ZipMessage = { id: string; from: 'self' | 'other'; text?: string; name?: string; blob?: Blob; status: 'pending' | 'delivered' | 'failed' | 'unconfirmed'; expired?: boolean };
export function context(packet: Pick<Packet, 'kind' | 'id' | 'index'>): string { return `${packet.kind}:${packet.id}:${packet.index ?? ''}`; }
