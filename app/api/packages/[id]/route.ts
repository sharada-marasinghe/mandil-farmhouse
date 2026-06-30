import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
