import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@/app/generated/prisma/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("[GET /api/admin/users] Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, name, role, phoneNumber } = await request.json();

    if (!email || !password || !role || !phoneNumber || !name) {
      return NextResponse.json(
        { success: false, error: "Name, email, password, phone, and role are required." },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered." },
        { status: 400 }
      );
    }

    const existingPhone = await db.user.findUnique({
      where: { phoneNumber },
    });

    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: "Phone number already in use." },
        { status: 400 }
      );
    }

    // Map role string to Role enum
    let dbRole: Role = Role.RESORT_MANAGER;
    if (role.toUpperCase() === "SUPER_ADMIN") {
      dbRole = Role.SUPER_ADMIN;
    } else if (role.toUpperCase() === "GUEST") {
      dbRole = Role.GUEST;
    }

    // Hash the password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        email,
        phoneNumber,
        password: hashedPassword,
        name: name,
        role: dbRole,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("[POST /api/admin/users] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, email, phoneNumber, role, isActive, password } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    // Check if updating email is unique
    if (email) {
      const existingUser = await db.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email already registered to another account." },
          { status: 400 }
        );
      }
    }

    // Check if updating phone number is unique
    if (phoneNumber) {
      const existingPhone = await db.user.findFirst({
        where: { phoneNumber, NOT: { id } },
      });
      if (existingPhone) {
        return NextResponse.json(
          { success: false, error: "Phone number already in use by another account." },
          { status: 400 }
        );
      }
    }

    // Prepare update data payload
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (role !== undefined) {
      let dbRole: Role = Role.GUEST;
      if (role.toUpperCase() === "SUPER_ADMIN") {
        dbRole = Role.SUPER_ADMIN;
      } else if (role.toUpperCase() === "RESORT_MANAGER") {
        dbRole = Role.RESORT_MANAGER;
      }
      updateData.role = dbRole;
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("[PUT /api/admin/users] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user details." },
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
        { success: false, error: "Cannot delete the last remaining user." },
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
      { success: false, error: "Failed to delete user." },
      { status: 500 }
    );
  }
}
