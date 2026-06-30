import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [packages, amenities, activities] = await Promise.all([
      db.package.findMany({
        orderBy: { name: "asc" },
      }),
      db.amenity.findMany({
        orderBy: { name: "asc" },
      }),
      db.activity.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    const serializedPackages = packages.map((pkg) => ({
      ...pkg,
      basePrice: pkg.basePrice.toNumber(),
    }));

    const serializedAmenities = amenities.map((am) => ({
      ...am,
      price: am.price.toNumber(),
    }));

    return NextResponse.json({
      success: true,
      packages: serializedPackages,
      amenities: serializedAmenities,
      activities: activities,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/inventory] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory from database." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let action = "";
    let name = "";
    let price = "";
    let billingType = "";
    let description = "";
    let id = "";
    let images: string[] = []; // will store merged existing + newly uploaded public URLs

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      action = (formData.get("action") as string) || "";
      name = (formData.get("name") as string) || "";
      price = (formData.get("price") as string) || "";
      billingType = (formData.get("billingType") as string) || "";
      description = (formData.get("description") as string) || "";
      id = (formData.get("id") as string) || "";

      // Get any existing images that the frontend retained
      const existingImages = formData.getAll("existingImages") as string[];

      const files = formData.getAll("images") as File[];
      const uploadedUrls: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          if (!file || typeof file === "string" || !file.name) continue;

          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const fileExtension = file.name.split(".").pop() || "png";
          const cleanName = file.name
            .replace(`.${fileExtension}`, "")
            .replace(/[^a-zA-Z0-9]/g, "_")
            .toLowerCase();

          const folderName = (action === "CREATE_AMENITY" || action === "UPDATE_AMENITY") ? "amenities" : "activities";
          const filePath = `${folderName}/${cleanName}-${Date.now()}.${fileExtension}`;

          const { error: uploadError } = await supabase.storage
            .from("images-b")
            .upload(filePath, buffer, {
              contentType: file.type,
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error(`[Supabase Upload Error] File: ${file.name}`, uploadError);
            throw new Error(`Failed to upload image "${file.name}": ${uploadError.message}`);
          }

          const { data } = supabase.storage.from("images-b").getPublicUrl(filePath);
          if (data?.publicUrl) {
            uploadedUrls.push(data.publicUrl);
          }
        }
      }
      images = [...existingImages, ...uploadedUrls];
    } else {
      const body = await request.json();
      action = body.action || "";
      name = body.name || "";
      price = body.price !== undefined ? String(body.price) : "";
      billingType = body.billingType || "";
      description = body.description || "";
      id = body.id || "";
      images = body.images || [];
    }

    if (action === "CREATE_AMENITY") {
      if (!name || price === "" || !billingType) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for amenity creation." },
          { status: 400 }
        );
      }
      const newAmenity = await db.amenity.create({
        data: {
          name: name.trim(),
          price: Number(price),
          billingType: billingType as any,
          description: description.trim() || null,
          images: images,
        },
      });
      return NextResponse.json({
        success: true,
        amenity: {
          ...newAmenity,
          price: newAmenity.price.toNumber(),
        },
      });
    }

    if (action === "UPDATE_AMENITY") {
      if (!id || !name || price === "" || !billingType) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for amenity update." },
          { status: 400 }
        );
      }
      const updatedAmenity = await db.amenity.update({
        where: { id },
        data: {
          name: name.trim(),
          price: Number(price),
          billingType: billingType as any,
          description: description.trim() || null,
          images: images,
        },
      });
      return NextResponse.json({
        success: true,
        amenity: {
          ...updatedAmenity,
          price: updatedAmenity.price.toNumber(),
        },
      });
    }

    if (action === "CREATE_ACTIVITY") {
      if (!name) {
        return NextResponse.json(
          { success: false, error: "Missing activity name." },
          { status: 400 }
        );
      }
      const newActivity = await db.activity.create({
        data: {
          name: name.trim(),
          description: description.trim() || null,
          images: images,
        },
      });
      return NextResponse.json({
        success: true,
        activity: newActivity,
      });
    }

    if (action === "UPDATE_ACTIVITY") {
      if (!id || !name) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for activity update." },
          { status: 400 }
        );
      }
      const updatedActivity = await db.activity.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description.trim() || null,
          images: images,
        },
      });
      return NextResponse.json({
        success: true,
        activity: updatedActivity,
      });
    }

    if (action === "DELETE_AMENITY") {
      if (!id) {
        return NextResponse.json({ success: false, error: "Missing amenity ID." }, { status: 400 });
      }
      await db.amenity.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (action === "DELETE_ACTIVITY") {
      if (!id) {
        return NextResponse.json({ success: false, error: "Missing activity ID." }, { status: 400 });
      }
      await db.activity.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action type." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[POST /api/admin/inventory] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process inventory request." },
      { status: 500 }
    );
  }
}
