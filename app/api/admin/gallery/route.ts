import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await supabase.storage
      .from("images-b")
      .list("gallery", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("[GET /api/admin/gallery] Supabase list error:", error);
      return NextResponse.json({ success: true, images: [] });
    }

    const images = (data || [])
      .filter((item) => item.name !== ".emptyFolderPlaceholder")
      .map((item) => {
        const filePath = `gallery/${item.name}`;
        const { data: urlData } = supabase.storage.from("images-b").getPublicUrl(filePath);
        return {
          id: item.id || item.name,
          name: item.name,
          url: urlData.publicUrl,
          filePath,
        };
      });

    return NextResponse.json({ success: true, images });
  } catch (err: any) {
    console.error("[GET /api/admin/gallery] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load gallery images." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || typeof file === "string" || !file.name) {
      return NextResponse.json(
        { success: false, error: "File upload is required." },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique name
    const fileExtension = file.name.split(".").pop() || "png";
    const cleanName = file.name
      .replace(`.${fileExtension}`, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    
    const filePath = `gallery/${cleanName}-${Date.now()}.${fileExtension}`;

    // Upload to Supabase bucket 'images-b'
    const { error: uploadError } = await supabase.storage
      .from("images-b")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[POST /api/admin/gallery] Upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from("images-b").getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      image: {
        id: filePath,
        name: file.name,
        url: urlData.publicUrl,
        filePath,
      },
    });
  } catch (err: any) {
    console.error("[POST /api/admin/gallery] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to upload image." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Image name is required." },
        { status: 400 }
      );
    }

    const filePath = `gallery/${name}`;

    const { data, error } = await supabase.storage
      .from("images-b")
      .remove([filePath]);

    if (error) {
      console.error("[DELETE /api/admin/gallery] Remove error:", error);
      return NextResponse.json(
        { success: false, error: `Delete failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE /api/admin/gallery] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete image." },
      { status: 500 }
    );
  }
}
