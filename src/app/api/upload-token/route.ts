import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Issues short-lived upload tokens so the browser can upload files
// directly to Vercel Blob, bypassing the 4.5 MB serverless function body limit.
export async function POST(request: Request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        if (!pathname.startsWith("drivers/")) {
          throw new Error("Invalid upload path");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
          maximumSizeInBytes: 15 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Driver doc uploaded:", blob.url);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload token error" },
      { status: 400 }
    );
  }
}
