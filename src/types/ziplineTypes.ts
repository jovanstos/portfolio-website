export type ChatMessage =
  | { id: string; from: "self" | "other"; type: "text"; text: string }
  | {
      id: string;
      from: "self" | "other";
      type: "file";
      name: string;
      blob: Blob;
    };

export interface QRCodeData {
  roomID: string;
  pairingCode: string;
}
