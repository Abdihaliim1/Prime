import { NextRequest, NextResponse } from "next/server";
import { createTables } from "@/lib/db";

// GET /api/setup — run once after provisioning the database
export async function GET(req: NextRequest) {
  const auth = req.cookies.get("pt-admin-auth")?.value;
  if (auth !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await createTables();
    return NextResponse.json({ ok: true, message: "Database tables created." });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
