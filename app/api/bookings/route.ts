// app/api/bookings/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/bookings — Create a new guest booking
//
// Payload (application/json):
//   guestName      string   required  Guest's full name
//   guestPhone     string   required  Guest's phone number
//   guestEmail     string   optional  Guest's email address
//   bookingDate    string   required  ISO-8601 date string (e.g. "2026-07-15")
//   numberOfGuests number   required  Positive integer ≥ 1
//   packageId      string   required  Prisma Package.id (cuid)
//
// Response 201: { success: true, booking: BookingWithPackage }
// Response 400: { success: false, error: string, details?: string[] }
// Response 500: { success: false, error: string }
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { PricingModel } from "@/app/generated/prisma";

// ── Runtime config ──────────────────────────────────────────────────────────
// Force Node.js runtime so Prisma (which requires Node APIs) always runs in
// a full runtime context and never in the Edge Runtime sandbox.
export const runtime = "nodejs";

// ── Types ────────────────────────────────────────────────────────────────────

interface CreateBookingPayload {
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  bookingDate: string;
  numberOfGuests: number;
  packageId: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Validate the incoming request body.
 * Returns a list of validation errors (empty array = valid).
 */
function validateCreatePayload(body: unknown): {
  data: CreateBookingPayload | null;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      data: null,
      errors: [{ field: "body", message: "Request body must be a JSON object." }],
    };
  }

  const b = body as Record<string, unknown>;

  // guestName
  if (!b.guestName || typeof b.guestName !== "string" || !b.guestName.trim()) {
    errors.push({ field: "guestName", message: "guestName is required and must be a non-empty string." });
  }

  // guestPhone
  if (!b.guestPhone || typeof b.guestPhone !== "string" || !b.guestPhone.trim()) {
    errors.push({ field: "guestPhone", message: "guestPhone is required and must be a non-empty string." });
  }

  // guestEmail (optional but if present must be string)
  if (b.guestEmail !== undefined && b.guestEmail !== null) {
    if (typeof b.guestEmail !== "string") {
      errors.push({ field: "guestEmail", message: "guestEmail must be a string when provided." });
    } else if (b.guestEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.guestEmail.trim())) {
      errors.push({ field: "guestEmail", message: "guestEmail must be a valid email address." });
    }
  }

  // bookingDate
  if (!b.bookingDate || typeof b.bookingDate !== "string") {
    errors.push({ field: "bookingDate", message: "bookingDate is required and must be an ISO-8601 date string." });
  } else {
    const parsed = new Date(b.bookingDate);
    if (isNaN(parsed.getTime())) {
      errors.push({ field: "bookingDate", message: "bookingDate is not a valid date string." });
    } else {
      // Booking must be in the future (allow same day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsed < today) {
        errors.push({ field: "bookingDate", message: "bookingDate must not be in the past." });
      }
    }
  }

  // numberOfGuests
  if (b.numberOfGuests === undefined || b.numberOfGuests === null) {
    errors.push({ field: "numberOfGuests", message: "numberOfGuests is required." });
  } else if (typeof b.numberOfGuests !== "number" || !Number.isInteger(b.numberOfGuests) || b.numberOfGuests < 1) {
    errors.push({ field: "numberOfGuests", message: "numberOfGuests must be a positive integer ≥ 1." });
  } else if (b.numberOfGuests > 500) {
    errors.push({ field: "numberOfGuests", message: "numberOfGuests cannot exceed 500." });
  }

  // packageId
  if (!b.packageId || typeof b.packageId !== "string" || !b.packageId.trim()) {
    errors.push({ field: "packageId", message: "packageId is required and must be a non-empty string." });
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      guestName: (b.guestName as string).trim(),
      guestPhone: (b.guestPhone as string).trim(),
      guestEmail: b.guestEmail ? (b.guestEmail as string).trim() : undefined,
      bookingDate: b.bookingDate as string,
      numberOfGuests: b.numberOfGuests as number,
      packageId: (b.packageId as string).trim(),
    },
    errors: [],
  };
}

/**
 * Compute totalPrice from package pricing rules.
 *
 * PER_PERSON: basePrice × numberOfGuests
 * PER_BOAT:   basePrice (flat fee — guest count does not change price)
 * CUSTOM:     basePrice is used as a deposit/placeholder; admin will finalise
 */
function computeTotalPrice(
  basePrice: { toNumber(): number },
  pricingModel: PricingModel,
  numberOfGuests: number
): number {
  const base = basePrice.toNumber();

  switch (pricingModel) {
    case PricingModel.PER_PERSON:
      return parseFloat((base * numberOfGuests).toFixed(2));
    case PricingModel.PER_BOAT:
      return parseFloat(base.toFixed(2));
    case PricingModel.CUSTOM:
      // Return basePrice as a deposit placeholder; admin will adjust.
      return parseFloat(base.toFixed(2));
    default:
      return parseFloat((base * numberOfGuests).toFixed(2));
  }
}

/**
 * Generate a unique "MF-XXXX" booking number.
 *
 * Strategy:
 *  1. Pick 4 random uppercase alphanumeric characters.
 *  2. Check the DB for a collision.
 *  3. Retry up to MAX_ATTEMPTS times before throwing.
 *
 * This keeps numbers short and human-readable while being collision-resistant
 * at the expected booking volumes for a small resort (36^4 = 1.6 M possibilities).
 */
const BOOKING_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I ambiguity
const BOOKING_NUMBER_SUFFIX_LENGTH = 4;
const MAX_GENERATION_ATTEMPTS = 10;

function generateSuffix(): string {
  let result = "";
  for (let i = 0; i < BOOKING_NUMBER_SUFFIX_LENGTH; i++) {
    result +=
      BOOKING_NUMBER_ALPHABET[
        Math.floor(Math.random() * BOOKING_NUMBER_ALPHABET.length)
      ];
  }
  return result;
}

async function generateUniqueBookingNumber(): Promise<string> {
  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    const candidate = `MF-${generateSuffix()}`;

    const existing = await db.booking.findUnique({
      where: { bookingNumber: candidate },
      select: { id: true }, // minimal projection
    });

    if (!existing) {
      return candidate;
    }
  }

  // Extremely unlikely to reach here at normal volumes; if we do, bail clearly.
  throw new Error(
    `Failed to generate a unique booking number after ${MAX_GENERATION_ATTEMPTS} attempts. ` +
      "This may indicate extremely high booking volume or a seeding issue."
  );
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  // 1. Parse request body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  // 2. Validate payload
  const { data, errors } = validateCreatePayload(rawBody);
  if (!data || errors.length > 0) {
    return Response.json(
      {
        success: false,
        error: "Validation failed.",
        details: errors.map((e) => `${e.field}: ${e.message}`),
      },
      { status: 400 }
    );
  }

  try {
    // 3. Fetch the requested package
    const selectedPackage = await db.package.findUnique({
      where: { id: data.packageId },
    });

    if (!selectedPackage) {
      return Response.json(
        {
          success: false,
          error: `Package with id "${data.packageId}" was not found.`,
        },
        { status: 400 }
      );
    }

    if (!selectedPackage.isActive) {
      return Response.json(
        {
          success: false,
          error: `Package "${selectedPackage.name}" is not currently available for booking.`,
        },
        { status: 400 }
      );
    }

    // 4. Compute total price based on the package's pricing model
    const totalPrice = computeTotalPrice(
      selectedPackage.basePrice,
      selectedPackage.pricingModel,
      data.numberOfGuests
    );

    // 5. Generate a unique booking number (checked against DB)
    const bookingNumber = await generateUniqueBookingNumber();

    // 6. Create booking inside a transaction so booking + initial activity log
    //    are always written atomically.
    const createdBooking = await db.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          guestEmail: data.guestEmail ?? null,
          bookingDate: new Date(data.bookingDate),
          numberOfGuests: data.numberOfGuests,
          totalPrice,
          packageId: data.packageId,
          // status defaults to PENDING (set in schema)
        },
        include: {
          package: {
            select: {
              id: true,
              name: true,
              basePrice: true,
              pricingModel: true,
            },
          },
        },
      });

      // Insert creation event into the activity log
      await tx.activityLog.create({
        data: {
          bookingId: booking.id,
          action: `Booking #${bookingNumber} created for ${data.guestName} (${data.numberOfGuests} guest${data.numberOfGuests === 1 ? "" : "s"}) on package "${selectedPackage.name}".`,
          previousValue: null,
          newValue: JSON.stringify({
            bookingNumber,
            status: "PENDING",
            totalPrice,
            packageId: data.packageId,
          }),
          performedBy: "system",
        },
      });

      return booking;
    });

    // 7. Serialize Decimal fields before returning (Prisma Decimal is not JSON-serialisable)
    const serialisedBooking = {
      ...createdBooking,
      totalPrice: createdBooking.totalPrice.toNumber(),
      package: {
        ...createdBooking.package,
        basePrice: createdBooking.package.basePrice.toNumber(),
      },
    };

    return Response.json(
      { success: true, booking: serialisedBooking },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    console.error("[POST /api/bookings] Database error:", error);

    return Response.json(
      { success: false, error: "Failed to create booking.", detail: message },
      { status: 500 }
    );
  }
}
