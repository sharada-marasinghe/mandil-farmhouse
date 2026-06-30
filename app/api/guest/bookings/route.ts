import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

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

    // NextAuth v5 session email resolves to user's registered username/email.
    // Query bookings matching guestEmail.
    const bookings = await db.booking.findMany({
      where: {
        guestEmail: session.user.email,
      },
      include: {
        package: {
          select: {
            name: true,
            images: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    // Serialize Decimal values
    const serializedBookings = bookings.map((b) => ({
      ...b,
      totalPrice: b.totalPrice.toNumber(),
      bookingDate: b.bookingDate.toISOString(),
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, bookings: serializedBookings });
  } catch (error: any) {
    console.error("[GET /api/guest/bookings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load guest reservations." },
      { status: 500 }
    );
  }
}
