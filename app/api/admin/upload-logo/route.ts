import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || typeof file === "string" || !file.name) {
      return NextResponse.json(
        { success: false, error: "File is required." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split(".").pop() || "png";
    const filePath = `branding/logo-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("images-b")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("[POST /api/admin/upload-logo] upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from("images-b").getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/upload-logo] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to upload logo." },
      { status: 500 }
    );
  }
}
