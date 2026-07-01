import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { PricingModel } from "@/app/generated/prisma/enums";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Package ID is required." },
        { status: 400 }
      );
    }

    const pkg = await db.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "Package not found." },
        { status: 404 }
      );
    }

    const serialised = {
      ...pkg,
      basePrice: pkg.basePrice.toNumber(),
    };

    return NextResponse.json({ success: true, package: serialised });
  } catch (error: any) {
    console.error(`[GET /api/packages/[id]] Database error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch package details." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Package ID is required." },
        { status: 400 }
      );
    }

    await db.package.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[DELETE /api/packages/[id]] Error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete package." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Package ID is required." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const name = (formData.get("name") as string) || "";
    const description = (formData.get("description") as string) || "";
    const basePrice = Number(formData.get("basePrice")) || 0;
    const pricingModel = (formData.get("pricingModel") as string) || "PER_PERSON";
    const isActive = formData.get("isActive") !== "false";

    const whatsIncludedStr = formData.get("whatsIncluded") as string;
    const whatsExcludedStr = formData.get("whatsExcluded") as string;
    const timelineStr = formData.get("timeline") as string;
    const aboutMarkdown = (formData.get("aboutMarkdown") as string) || "";

    let whatsIncluded: string[] = [];
    let whatsExcluded: string[] = [];
    let timeline: any[] = [];

    try {
      if (whatsIncludedStr) whatsIncluded = JSON.parse(whatsIncludedStr);
      if (whatsExcludedStr) whatsExcluded = JSON.parse(whatsExcludedStr);
      if (timelineStr) timeline = JSON.parse(timelineStr);
    } catch (e) {
      console.error("JSON parsing error for package fields in PUT:", e);
    }

    // Retained existing image URLs
    const existingImagesStr = formData.get("existingImages") as string;
    let retainedImages: string[] = [];
    if (existingImagesStr) {
      try {
        retainedImages = JSON.parse(existingImagesStr);
      } catch (e) {
        console.error("Error parsing existingImages", e);
      }
    }

    // New uploaded files
    const files = formData.getAll("images") as File[];
    const uploadedUrls: string[] = [];

    if (files && files.length > 0) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Supabase Service Role Key is not configured.");
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file || typeof file === "string" || !file.name) continue;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExtension = file.name.split(".").pop() || "png";
        const cleanName = file.name
          .replace(`.${fileExtension}`, "")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .toLowerCase();
        
        const filePath = `packages/${cleanName}-${Date.now()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("images-b")
          .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(`[Supabase Upload Error] File: ${file.name}`, uploadError);
          throw new Error(`Failed to upload image "${file.name}" to storage: ${uploadError.message}`);
        }

        const { data } = supabase.storage.from("images-b").getPublicUrl(filePath);
        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
      }
    }

    // Combine retained and newly uploaded image URLs
    const finalImages = [...retainedImages, ...uploadedUrls];

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Package name is required." },
        { status: 400 }
      );
    }

    const updatedPackage = await db.package.update({
      where: { id },
      data: {
        name,
        description: description || null,
        basePrice: Number(basePrice) || 0,
        pricingModel: (pricingModel as PricingModel) || PricingModel.PER_PERSON,
        isActive: typeof isActive === "boolean" ? isActive : true,
        images: finalImages,
        whatsIncluded,
        whatsExcluded,
        timeline,
        aboutMarkdown: aboutMarkdown || null,
      },
    });

    return NextResponse.json({
      success: true,
      package: {
        ...updatedPackage,
        basePrice: updatedPackage.basePrice.toNumber(),
      },
    });
  } catch (error: any) {
    console.error("[PUT /api/packages/[id]] Update/DB error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update package in database." },
      { status: 500 }
    );
  }
}
