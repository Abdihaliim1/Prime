import { NextRequest, NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminToken, getAdminCredentials } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const credentials = getAdminCredentials();
  if (!credentials) {
    return NextResponse.json({ ok: false, error: "Admin credentials are not configured." }, { status: 500 });
  }

  if (username === credentials.username && password === credentials.password) {
    const token = await createAdminToken(username);
    if (!token) {
      return NextResponse.json({ ok: false, error: "Admin credentials are not configured." }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    return res;
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
