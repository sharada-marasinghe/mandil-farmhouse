import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
