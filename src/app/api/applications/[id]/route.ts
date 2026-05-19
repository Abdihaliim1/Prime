import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// PATCH /api/applications/:id — update status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.cookies.get("pt-admin-auth")?.value;
  if (auth !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const allowed = ["new", "reviewing", "approved", "rejected"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await sql`UPDATE applications SET status = ${status} WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

// GET /api/applications/:id — full detail (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.cookies.get("pt-admin-auth")?.value;
  if (auth !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { rows } = await sql`SELECT * FROM applications WHERE id = ${id}`;

  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ application: rows[0] });
}
