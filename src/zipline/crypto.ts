// All of these functions are self documenting
// They are helpers used to handle the creation of the end 2 end encryption in zipline
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

export async function exportPublicKey(key: CryptoKey) {
  const buffer = await crypto.subtle.exportKey("spki", key);

  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export async function importPublicKey(base64: string) {
  const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "spki",
    buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"],
  );
}

export async function encryptText(text: string, publicKey: CryptoKey) {
  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encoded,
  );

  return encrypted;
}

export async function decryptText(
  encrypted: ArrayBuffer,
  privateKey: CryptoKey,
) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encrypted,
  );

  return new TextDecoder().decode(decrypted);
}

export async function generateAESKey() {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function exportAESKey(key: CryptoKey) {
  const raw = await crypto.subtle.exportKey("raw", key);

  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

export async function importAESKey(base64: string) {
  const raw = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function aesEncrypt(data: Uint8Array, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data as BufferSource,
  );

  return {
    iv: btoa(String.fromCharCode(...iv)),
    payload: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
  };
}

export async function aesDecrypt(
  encrypted: { iv: string; payload: string },
  key: CryptoKey,
) {
  const iv = Uint8Array.from(atob(encrypted.iv), (c) => c.charCodeAt(0));
  const data = Uint8Array.from(atob(encrypted.payload), (c) => c.charCodeAt(0));

  // Data.buffer must be used here because it's type script safe
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data.buffer,
  );

  return new Uint8Array(decrypted);
}
