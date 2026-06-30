import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // Map email directly to username in database schema
    const existingUser = await db.user.findUnique({
      where: { username: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Hash the password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        username: email,
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
