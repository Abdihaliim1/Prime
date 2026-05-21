import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function sanitize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40) || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const label = (form.get("label") as string) || "doc";
    const appId = (form.get("appId") as string) || "unknown";
    const firstName = (form.get("firstName") as string) || "";
    const lastName = (form.get("lastName") as string) || "";
    const dob = (form.get("dob") as string) || "";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF, JPG, and PNG files are allowed." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File must be 10 MB or smaller." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "bin";

    // Build human-readable folder: drivers/lastname_firstname_dob/appId/label.ext
    const driverFolder = (lastName || firstName || dob)
      ? `${sanitize(lastName)}_${sanitize(firstName)}_${sanitize(dob)}`
      : "unknown_driver";

    const filename = `drivers/${driverFolder}/${appId}/${label}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
  }
}
