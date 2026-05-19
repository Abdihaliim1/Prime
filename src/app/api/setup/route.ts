import { NextRequest, NextResponse } from "next/server";
import { createTables } from "@/lib/db";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth";

// GET /api/setup — run once after provisioning the database
export async function GET(req: NextRequest) {
  const auth = req.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await createTables();
    return NextResponse.json({ ok: true, message: "Database tables created." });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
