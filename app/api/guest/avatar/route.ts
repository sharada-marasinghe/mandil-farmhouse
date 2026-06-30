import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || typeof file === "string" || !file.name) {
      return NextResponse.json(
        { success: false, error: "Image file is required." },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split(".").pop() || "png";
    const cleanEmail = session.user.email.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const filePath = `avatars/${cleanEmail}-${Date.now()}.${fileExtension}`;

    // Upload to Supabase bucket 'images-b'
    const { error: uploadError } = await supabase.storage
      .from("images-b")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("[POST /api/guest/avatar] Upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from("images-b").getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      avatarUrl: urlData.publicUrl,
    });
  } catch (error: any) {
    console.error("[POST /api/guest/avatar] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload avatar image." },
      { status: 500 }
    );
  }
}
