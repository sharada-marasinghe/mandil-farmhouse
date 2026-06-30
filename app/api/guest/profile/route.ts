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
        email: session.user.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        phone: user.phoneNumber || "",
        city: "Colombo", // Mocked fallback for non-schema field
        avatarUrl: user.image || null,
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

    const { name, phone, currentPassword, newPassword, avatarUrl } = await request.json();

    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
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

    if (phone) {
      updateData.phoneNumber = phone;
    }

    if (avatarUrl) {
      updateData.image = avatarUrl;
    }

    // Handle Password Change if requested
    if (currentPassword && newPassword && user.password) {
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
        email: session.user.email,
      },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedUser.id,
        name: updatedUser.name || "",
        email: updatedUser.email,
        phone: updatedUser.phoneNumber,
        city: "Colombo",
        avatarUrl: updatedUser.image || null,
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
