const ITERATIONS = 100_000;
const KEY_LEN = 64; // in bytes (512 bits)
const SEPARATOR = ":";

function bufToHex(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.byteLength; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

async function deriveBits(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const baseKey = await globalThis.crypto.subtle.importKey(
    "raw",
    passwordData,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  return await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-512",
      salt: salt as unknown as BufferSource, // Cast to any to prevent TS2322 generic mismatch on BufferSource in older/newer environments
      iterations: ITERATIONS,
    },
    baseKey,
    KEY_LEN * 8 // Length in bits
  );
}

/**
 * Hashes a plain-text password using PBKDF2-SHA512 via the Web Crypto API.
 * This is 100% compatible with both Edge and Node.js runtimes.
 * Returns a string in the format: iterations:salt:hash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const derived = await deriveBits(password, salt);
  return [ITERATIONS, bufToHex(salt), bufToHex(derived)].join(SEPARATOR);
}

/**
 * Verifies a plain-text password against a stored PBKDF2 hash using Web Crypto API.
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(SEPARATOR);
  if (parts.length !== 3) return false;

  const [, saltHex, storedHashHex] = parts;
  const salt = hexToBuf(saltHex);
  const storedHash = hexToBuf(storedHashHex);

  const candidateHashBuf = await deriveBits(password, salt);
  const candidateHash = new Uint8Array(candidateHashBuf);

  return timingSafeEqual(storedHash, candidateHash);
}
