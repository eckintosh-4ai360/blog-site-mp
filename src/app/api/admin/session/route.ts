import { NextResponse } from "next/server";
import { adminCookie, createAdminSession, hasAdminSession, validAdminCredentials } from "@/lib/admin-session";

export async function GET() {
  return NextResponse.json({ authenticated: await hasAdminSession() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body?.email !== "string" || typeof body?.password !== "string" || !validAdminCredentials(body.email, body.password)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(adminCookie.name, createAdminSession(), adminCookie.options);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminCookie.name, "", { ...adminCookie.options, maxAge: 0 });
  return response;
}
