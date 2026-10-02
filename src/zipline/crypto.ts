import type { Envelope } from "../../backend/shared/zipline";
const source = (value: Uint8Array): ArrayBuffer => new Uint8Array(value).buffer;
export async function generateKeyPair() {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );
}
function base64(bytes: Uint8Array) {
  let text = "";
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text);
}
function unbase64(value: string) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}
export async function exportPublicKey(key: CryptoKey) {
  return base64(new Uint8Array(await crypto.subtle.exportKey("spki", key)));
}
export async function importPublicKey(value: string) {
  return crypto.subtle.importKey(
    "spki",
    source(unbase64(value)),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}
export async function generateAESKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}
export async function wrapKey(key: CryptoKey, publicKey: CryptoKey) {
  return base64(
    new Uint8Array(
      await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        await crypto.subtle.exportKey("raw", key),
      ),
    ),
  );
}
export async function unwrapKey(value: string, privateKey: CryptoKey) {
  const raw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    source(unbase64(value)),
  );
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}
export async function aesEncrypt(
  data: Uint8Array,
  key: CryptoKey,
  context: string,
): Promise<Envelope> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(context) },
    key,
    source(data),
  );
  return { iv, ciphertext: new Uint8Array(ciphertext) };
}
export async function aesDecrypt(
  value: Envelope,
  key: CryptoKey,
  context: string,
): Promise<Uint8Array> {
  return new Uint8Array(
    await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: source(value.iv),
        additionalData: new TextEncoder().encode(context),
      },
      key,
      source(value.ciphertext),
    ),
  );
}
export async function digest(bytes: Uint8Array) {
  return [
    ...new Uint8Array(await crypto.subtle.digest("SHA-256", source(bytes))),
  ]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
