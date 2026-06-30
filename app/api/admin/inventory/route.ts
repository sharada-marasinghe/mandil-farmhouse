import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    const body = await request.json();
    const { action, name, price, billingType, description, id } = body;

    if (action === "CREATE_AMENITY") {
      if (!name || price === undefined || !billingType) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for amenity creation." },
          { status: 400 }
        );
      }
      const newAmenity = await db.amenity.create({
        data: {
          name: name.trim(),
          price: Number(price),
          billingType,
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
          description: description?.trim() || null,
        },
      });
      return NextResponse.json({
        success: true,
        activity: newActivity,
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
