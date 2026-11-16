import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "mp_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD_HASH = Buffer.from("61a679ec01d9db5f3b9021e6f08a35d28b45e4140ad598022a1593884fdc3faa", "hex");

function sessionSecret() {
  // The database URL is server-only and provides a stable key when a dedicated
  // session secret has not been configured in the deployment environment.
  return process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL;
}

function sign(value: string) {
  const secret = sessionSecret();
  if (!secret) throw new Error("No admin session signing key is configured");
  return createHmac("sha256", secret).update(`mp-admin-session:${value}`).digest("hex");
}

export function validAdminCredentials(email: string, password: string) {
  if (!sessionSecret()) return false;
  if (email.length > 254 || password.length > 256) return false;
  const suppliedEmail = Buffer.from(email.trim().toLowerCase());
  const expectedEmail = Buffer.from(ADMIN_EMAIL);
  const emailMatches = suppliedEmail.length === expectedEmail.length && timingSafeEqual(suppliedEmail, expectedEmail);
  const suppliedHash = scryptSync(password, "mp-portal-admin-v1", 32);
  return emailMatches && timingSafeEqual(suppliedHash, ADMIN_PASSWORD_HASH);
}

export function createAdminSession() {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${expires}.${sign(expires)}`;
}

export async function hasAdminSession() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;
  const [expires, signature, extra] = value.split(".");
  if (extra || !/^\d+$/.test(expires) || !/^[a-f0-9]{64}$/.test(signature ?? "")) return false;
  if (Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(sign(expires), "hex"));
  } catch {
    return false;
  }
}

export const adminCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_SECONDS,
  },
};
