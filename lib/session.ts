import { createHmac, timingSafeEqual } from "node:crypto";

const sessionDurationSeconds = 60 * 60 * 24;
const developmentSecret = "edunusa-local-session-secret";

export type SessionClaims = {
  email: string;
  role: string;
  expiresAt: number;
  name?: string;
  grade?: string;
  subject?: string;
  studentId?: string;
};

function getSessionSecret() {
  return (
    process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : developmentSecret)
  );
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(
  email: string,
  role: string,
  profile: Pick<SessionClaims, "name" | "grade" | "subject" | "studentId"> = {},
) {
  const secret = getSessionSecret();
  if (!secret) return null;

  const claims: SessionClaims = {
    email,
    role,
    expiresAt: Math.floor(Date.now() / 1000) + sessionDurationSeconds,
    ...profile,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");

  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined) {
  const secret = getSessionSecret();
  if (!secret || !token) return null;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionClaims;
    if (
      !claims.email ||
      !claims.role ||
      !Number.isFinite(claims.expiresAt) ||
      claims.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}
