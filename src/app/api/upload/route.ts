import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// POST /api/upload — accepts a single file, returns its public URL
// Called from the apply form before submitting the application
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const label = (form.get("label") as string) || "doc";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `applications/${label}-${Date.now()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
