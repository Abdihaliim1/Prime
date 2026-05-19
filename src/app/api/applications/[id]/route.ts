import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { del } from "@vercel/blob";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth";

// PATCH /api/applications/:id — update status or delete a document (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Delete a specific document
  if (body.deleteDoc) {
    const DOC_FIELDS = ["doc_cdl_front", "doc_cdl_back", "doc_medical", "doc_mvr", "doc_other"] as const;
    type DocField = typeof DOC_FIELDS[number];
    if (!(DOC_FIELDS as readonly string[]).includes(body.deleteDoc)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }
    // Remove from Blob storage
    if (body.url) {
      try { await del(body.url); } catch { /* blob may already be gone */ }
    }
    // Null out the column — one case per field (tagged templates require literal column names)
    const field = body.deleteDoc as DocField;
    switch (field) {
      case "doc_cdl_front": await sql`UPDATE applications SET doc_cdl_front = NULL WHERE id = ${id}`; break;
      case "doc_cdl_back":  await sql`UPDATE applications SET doc_cdl_back  = NULL WHERE id = ${id}`; break;
      case "doc_medical":   await sql`UPDATE applications SET doc_medical   = NULL WHERE id = ${id}`; break;
      case "doc_mvr":       await sql`UPDATE applications SET doc_mvr       = NULL WHERE id = ${id}`; break;
      case "doc_other":     await sql`UPDATE applications SET doc_other     = NULL WHERE id = ${id}`; break;
    }
    return NextResponse.json({ ok: true });
  }

  // Update status
  const { status } = body;
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
  const auth = req.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { rows } = await sql`SELECT * FROM applications WHERE id = ${id}`;

  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ application: rows[0] });
}

// DELETE /api/applications/:id — remove application + all uploaded docs (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Fetch the app to get its blob URLs before deleting
  const { rows } = await sql`
    SELECT doc_cdl_front, doc_cdl_back, doc_medical, doc_mvr, doc_other
    FROM applications WHERE id = ${id}
  `;
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove every uploaded file from Blob storage
  const urls = [rows[0].doc_cdl_front, rows[0].doc_cdl_back, rows[0].doc_medical, rows[0].doc_mvr, rows[0].doc_other]
    .filter((u): u is string => typeof u === "string" && u.length > 0);
  for (const url of urls) {
    try { await del(url); } catch { /* blob may already be gone */ }
  }

  await sql`DELETE FROM applications WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
