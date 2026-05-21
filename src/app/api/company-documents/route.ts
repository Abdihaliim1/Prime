import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { ADMIN_AUTH_COOKIE, verifyAdminToken } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const auth = req.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const name = (form.get("name") as string)?.trim();
    const category = (form.get("category") as string)?.trim();
    const expires = (form.get("expires") as string)?.trim() || null;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Document name required" }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category required" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF, JPG, and PNG files are allowed." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File must be 10 MB or smaller." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const id = "DOC-" + Math.random().toString(36).slice(2, 10).toUpperCase();
    const filename = `company/${id}.${ext}`;

    const blob = await put(filename, file, { access: "public", contentType: file.type });

    try {
      await sql`
        INSERT INTO company_documents (id, name, category, expires, url, file_size, content_type)
        VALUES (${id}, ${name}, ${category}, ${expires}, ${blob.url}, ${file.size}, ${file.type})
      `;
    } catch (dbErr) {
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      if (msg.includes("does not exist")) {
        return NextResponse.json({ error: "Database not initialized. Visit /api/setup once to create the company_documents table." }, { status: 500 });
      }
      throw dbErr;
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("Company doc upload error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = req.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (!(await verifyAdminToken(auth))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows } = await sql`SELECT * FROM company_documents ORDER BY uploaded_at DESC`;
    return NextResponse.json({ documents: rows });
  } catch {
    return NextResponse.json({ documents: [] });
  }
}
