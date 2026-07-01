import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { PricingModel } from "@/app/generated/prisma/enums";

export const runtime = "nodejs";

export async function GET() {
  try {
    const packages = await db.package.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    
    const serialised = packages.map((pkg) => ({
      ...pkg,
      basePrice: pkg.basePrice.toNumber(),
    }));
    
    return NextResponse.json({ success: true, packages: serialised });
  } catch (error: any) {
    console.error("[GET /api/packages] Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch packages from database." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      console.error("JSON parsing error for package fields:", e);
    }

    const files = formData.getAll("images") as File[];
    const publicUrls: string[] = [];

    if (files && files.length > 0) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error(
          "Supabase Service Role Key is not configured on the server. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local. file."
        );
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
          publicUrls.push(data.publicUrl);
        }
      }
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Package name is required." },
        { status: 400 }
      );
    }

    const newPackage = await db.package.create({
      data: {
        name,
        description: description || null,
        basePrice: Number(basePrice) || 0,
        pricingModel: (pricingModel as PricingModel) || PricingModel.PER_PERSON,
        isActive: typeof isActive === "boolean" ? isActive : true,
        images: publicUrls,
        whatsIncluded,
        whatsExcluded,
        timeline,
        aboutMarkdown: aboutMarkdown || null,
      },
    });

    return NextResponse.json({
      success: true,
      package: {
        ...newPackage,
        basePrice: newPackage.basePrice.toNumber(),
      },
    });
  } catch (error: any) {
    console.error("[POST /api/packages] Upload/DB error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create package in database." },
      { status: 500 }
    );
  }
}
