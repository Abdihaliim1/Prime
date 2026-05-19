import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { sql } from "@/lib/db";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { rows } = await sql`SELECT url FROM company_documents WHERE id = ${id}`;
  if (rows.length && rows[0].url) {
    try { await del(rows[0].url as string); } catch { /* blob may be gone */ }
  }
  await sql`DELETE FROM company_documents WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
