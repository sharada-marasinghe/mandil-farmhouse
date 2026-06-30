import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, phone number, and password are required." },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const existingPhone = await db.user.findUnique({
      where: { phoneNumber: phone },
    });

    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: "An account with this phone number already exists." },
        { status: 400 }
      );
    }

    // Hash the password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        email,
        phoneNumber: phone,
        password: hashedPassword,
        name: name,
        role: "GUEST",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[POST /api/auth/register] DB Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create guest account." },
      { status: 500 }
    );
  }
}
