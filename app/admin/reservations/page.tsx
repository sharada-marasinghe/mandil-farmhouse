import { db } from "@/lib/db";
import ReservationsClient from "./ReservationsClient";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const bookings = await db.booking.findMany({
    include: {
      package: { select: { id: true, name: true, basePrice: true, pricingModel: true } },
      activityLogs: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = bookings.map((b) => ({
    ...b,
    totalPrice: b.totalPrice.toNumber(),
    bookingDate: b.bookingDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    package: { ...b.package, basePrice: b.package.basePrice.toNumber() },
    activityLogs: b.activityLogs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
  }));

  return <ReservationsClient initialBookings={serialized} />;
}
