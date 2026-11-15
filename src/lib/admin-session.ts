import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "mp_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function validAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword || !process.env.ADMIN_SESSION_SECRET) return false;
  const supplied = Buffer.from(`${email.trim().toLowerCase()}\0${password}`);
  const expected = Buffer.from(`${expectedEmail.trim().toLowerCase()}\0${expectedPassword}`);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
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
