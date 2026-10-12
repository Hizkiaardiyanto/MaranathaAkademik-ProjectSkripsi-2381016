import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const deriveKey = (
  password: string,
  salt: Buffer,
  keyLength: number,
) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, saltValue, keyValue, extra] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltValue || !keyValue || extra) return false;

  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expected = Buffer.from(keyValue, "base64url");
    if (!salt.length || !expected.length) return false;
    const actual = await deriveKey(password, salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}
