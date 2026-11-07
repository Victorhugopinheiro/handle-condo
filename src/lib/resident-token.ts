import { jwtVerify, SignJWT } from "jose";
import { RESIDENT_COOKIE, RESIDENT_SESSION_MAX_AGE } from "@/lib/constants";

export type ResidentToken = {
  residentId: number;
  email: string;
};

function getSecret() {
  const secret = process.env.RESIDENT_SESSION_SECRET;
  if (!secret) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function signResidentToken(payload: ResidentToken) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("RESIDENT_SESSION_SECRET is not set");
  }
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${RESIDENT_SESSION_MAX_AGE}s`)
    .sign(secret);
}

export async function verifyResidentToken(
  token: string
): Promise<ResidentToken | null> {
  try {
    const secret = getSecret();
    if (!secret) {
      return null;
    }
    const { payload } = await jwtVerify(token, secret);
    const residentId = Number(payload.residentId);
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!Number.isFinite(residentId) || !email) {
      return null;
    }
    return { residentId, email };
  } catch {
    return null;
  }
}

export function residentCookieOptions() {
  return {
    name: RESIDENT_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: RESIDENT_SESSION_MAX_AGE,
  };
}
