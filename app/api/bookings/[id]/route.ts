// app/api/bookings/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/bookings/[id] — Admin: update booking status and/or notes
//
// Path parameter:
//   id   string   The Booking.id (cuid)
//
// Payload (application/json) — all fields optional, at least one required:
//   status      "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"   optional
//   adminNotes  string                                                  optional
//
// Behaviour inside a Prisma transaction:
//   a) Reads the current booking state (for the activity log diff)
//   b) Updates Booking with the supplied fields
//   c) Inserts an ActivityLog row describing what changed
//
// Response 200: { success: true, booking: BookingWithPackage, activityLog: ActivityLog }
// Response 400: { success: false, error: string, details?: string[] }
// Response 404: { success: false, error: string }
// Response 500: { success: false, error: string }
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { BookingStatus } from "@/app/generated/prisma";
import { auth } from "@/auth";


// ── Runtime config ───────────────────────────────────────────────────────────
export const runtime = "nodejs";

// ── Constants ────────────────────────────────────────────────────────────────

/**
 * All valid status transitions (from → [allowed next statuses]).
 * COMPLETED and CANCELLED are terminal — no transitions out.
 */
const VALID_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]:    [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]:  [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.CANCELLED]:  [], // terminal
  [BookingStatus.COMPLETED]:  [], // terminal
};

/** Set of all valid BookingStatus string values for quick lookup */
const VALID_STATUSES = new Set<string>(Object.values(BookingStatus));

// ── Types ────────────────────────────────────────────────────────────────────

interface UpdateBookingPayload {
  status?: BookingStatus;
  adminNotes?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Validate the PATCH request body.
 * At least one of `status` or `adminNotes` must be present.
 */
function validateUpdatePayload(body: unknown): {
  data: UpdateBookingPayload | null;
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
  const result: UpdateBookingPayload = {};

  // status — optional but if present must be a valid enum value
  if ("status" in b) {
    if (typeof b.status !== "string" || !VALID_STATUSES.has(b.status)) {
      errors.push({
        field: "status",
        message: `status must be one of: ${[...VALID_STATUSES].join(", ")}.`,
      });
    } else {
      result.status = b.status as BookingStatus;
    }
  }

  // adminNotes — optional but if present must be a string
  if ("adminNotes" in b) {
    if (typeof b.adminNotes !== "string") {
      errors.push({ field: "adminNotes", message: "adminNotes must be a string." });
    } else {
      result.adminNotes = b.adminNotes.trim();
    }
  }

  // At least one field must be provided
  if (Object.keys(result).length === 0 && errors.length === 0) {
    errors.push({
      field: "body",
      message: "At least one field must be provided: status or adminNotes.",
    });
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return { data: result, errors: [] };
}

/**
 * Build a human-readable activity log action description.
 */
function buildActionDescription(
  bookingNumber: string,
  prevStatus: BookingStatus,
  payload: UpdateBookingPayload
): string {
  const parts: string[] = [];

  if (payload.status && payload.status !== prevStatus) {
    parts.push(`Status updated from ${prevStatus} to ${payload.status}.`);
  }

  if (payload.adminNotes !== undefined) {
    parts.push(
      payload.adminNotes
        ? `Admin notes updated.`
        : `Admin notes cleared.`
    );
  }

  const summary = parts.join(" ");
  return `[#${bookingNumber}] ${summary}`;
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  // 1. Await params (Next.js 15: params is a Promise)
  const { id } = await params;

  if (!id || typeof id !== "string" || !id.trim()) {
    return Response.json(
      { success: false, error: "Booking id path parameter is required." },
      { status: 400 }
    );
  }

  // 1b. Enforce NextAuth session authentication
  const session = await auth();
  if (!session || !session.user) {
    return Response.json(
      { success: false, error: "Unauthorized access. Admin privileges required." },
      { status: 401 }
    );
  }
  const operatorName = session.user.name || "Super Admin";


  // 2. Parse request body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  // 3. Validate payload
  const { data, errors } = validateUpdatePayload(rawBody);
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
    // 4. Fetch the existing booking — needed for diff and transition guard
    const existingBooking = await db.booking.findUnique({
      where: { id },
      select: {
        id: true,
        bookingNumber: true,
        status: true,
        adminNotes: true,
      },
    });

    if (!existingBooking) {
      return Response.json(
        { success: false, error: `Booking with id "${id}" was not found.` },
        { status: 404 }
      );
    }

    // 5. Enforce valid status transition (if status is being changed)
    if (data.status && data.status !== existingBooking.status) {
      const allowedNext = VALID_STATUS_TRANSITIONS[existingBooking.status];

      if (allowedNext.length === 0) {
        return Response.json(
          {
            success: false,
            error: `Booking #${existingBooking.bookingNumber} is in a terminal state (${existingBooking.status}) and cannot be updated.`,
          },
          { status: 400 }
        );
      }

      if (!allowedNext.includes(data.status)) {
        return Response.json(
          {
            success: false,
            error: `Invalid status transition: ${existingBooking.status} → ${data.status}. ` +
              `Allowed transitions: ${allowedNext.join(", ")}.`,
          },
          { status: 400 }
        );
      }
    }

    // 6. Build the "previous" snapshot for the activity log
    const previousSnapshot = JSON.stringify({
      status: existingBooking.status,
      adminNotes: existingBooking.adminNotes,
    });

    // 7. Build the update payload for Prisma
    const updateData: {
      status?: BookingStatus;
      adminNotes?: string | null;
    } = {};

    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.adminNotes !== undefined) {
      // Allow explicit empty string to clear notes; store null in DB for consistency
      updateData.adminNotes = data.adminNotes === "" ? null : data.adminNotes;
    }

    // 8. Run update + activity log inside a transaction
    const { updatedBooking, logEntry } = await db.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: updateData,
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

      const newSnapshot = JSON.stringify({
        status: booking.status,
        adminNotes: booking.adminNotes,
      });

      const actionDescription = buildActionDescription(
        booking.bookingNumber,
        existingBooking.status,
        data
      );

      const activityLog = await tx.activityLog.create({
        data: {
          bookingId: booking.id,
          action: actionDescription,
          previousValue: previousSnapshot,
          newValue: newSnapshot,
          performedBy: operatorName,
        },
      });

      return { updatedBooking: booking, logEntry: activityLog };
    });

    // 9. Serialize Decimal fields (Prisma Decimal is not directly JSON-serialisable)
    const serialisedBooking = {
      ...updatedBooking,
      totalPrice: updatedBooking.totalPrice.toNumber(),
      package: {
        ...updatedBooking.package,
        basePrice: updatedBooking.package.basePrice.toNumber(),
      },
    };

    return Response.json(
      {
        success: true,
        booking: serialisedBooking,
        activityLog: logEntry,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    console.error(`[PATCH /api/bookings/${id}] Database error:`, error);

    return Response.json(
      { success: false, error: "Failed to update booking.", detail: message },
      { status: 500 }
    );
  }
}
