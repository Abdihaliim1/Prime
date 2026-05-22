import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

// Issues short-lived upload tokens so the browser can upload files
// directly to Vercel Blob, bypassing the 4.5 MB serverless function body limit.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Only allow uploads to the drivers/ folder (driver application form)
        if (!pathname.startsWith("drivers/")) {
          throw new Error("Invalid upload path");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
          maximumSizeInBytes: 15 * 1024 * 1024, // 15 MB cap (generous for trucking docs)
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
