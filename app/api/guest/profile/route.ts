import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: {
        username: session.user.email,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    // Return the user. Include fallback mock data for fields not in the database schema.
    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name || "",
        email: user.username,
        phone: "0771234567", // Mocked fallback
        city: "Colombo",     // Mocked fallback
        avatarUrl: session.user.image || null,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/guest/profile] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve profile." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { name, phone, city, currentPassword, newPassword, avatarUrl } = await request.json();

    const user = await db.user.findUnique({
      where: {
        username: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (name) {
      updateData.name = name;
    }

    // Handle Password Change if requested
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect." },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await db.user.update({
      where: {
        username: session.user.email,
      },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedUser.id,
        name: updatedUser.name || "",
        email: updatedUser.username,
        phone: phone || "0771234567",
        city: city || "Colombo",
        avatarUrl: avatarUrl || null,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/guest/profile] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
