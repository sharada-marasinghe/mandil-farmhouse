import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("[GET /api/admin/users] Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { username, password, name, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Username, password and role are required." },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Username already exists." },
        { status: 400 }
      );
    }

    // Hash the password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        name: name || null,
        role: role.toUpperCase(),
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("[POST /api/admin/users] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create team member." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    const userCount = await db.user.count();
    if (userCount <= 1) {
      return NextResponse.json(
        { success: false, error: "Cannot delete the last remaining admin user." },
        { status: 400 }
      );
    }

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /api/admin/users] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete team member." },
      { status: 500 }
    );
  }
}
