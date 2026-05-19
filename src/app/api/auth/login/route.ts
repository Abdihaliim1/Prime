import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const adminUser = process.env.ADMIN_USERNAME ?? "admin";
  const adminPass = process.env.ADMIN_PASSWORD ?? "prime2024";

  if (username === adminUser && password === adminPass) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("pt-admin-auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return res;
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
