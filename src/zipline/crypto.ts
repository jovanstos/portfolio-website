export async function generateKeyPair() {
    return crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function exportPublicKey(key: CryptoKey) {
    const buffer = await crypto.subtle.exportKey("spki", key);
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export async function importPublicKey(base64: string) {
    const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return crypto.subtle.importKey(
        "spki",
        buffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
    );
}

export async function encryptText(text: string, publicKey: CryptoKey) {
    const encoded = new TextEncoder().encode(text);
    const encrypted = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        encoded
    );
    return encrypted;
}

export async function decryptText(
    encrypted: ArrayBuffer,
    privateKey: CryptoKey
) {
    const decrypted = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encrypted
    );
    return new TextDecoder().decode(decrypted);
}
