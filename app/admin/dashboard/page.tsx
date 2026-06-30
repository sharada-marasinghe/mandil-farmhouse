import { db } from "@/lib/db";
import DashboardOverviewClient from "./DashboardOverviewClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch overview data server-side
  const [bookings, packages, amenities, activities] = await Promise.all([
    db.booking.findMany({
      include: {
        package: { select: { id: true, name: true, basePrice: true, pricingModel: true } },
        activityLogs: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.package.findMany({ orderBy: { name: "asc" } }),
    db.amenity.findMany({ orderBy: { name: "asc" } }),
    db.activity.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Serialize Decimal/Date to plain JSON-safe values
  const serializedBookings = bookings.map((b) => ({
    ...b,
    totalPrice: b.totalPrice.toNumber(),
    bookingDate: b.bookingDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    package: { ...b.package, basePrice: b.package.basePrice.toNumber() },
    activityLogs: b.activityLogs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
  }));

  return (
    <DashboardOverviewClient
      bookings={serializedBookings}
      packageCount={packages.length}
      amenityCount={amenities.length}
      activityCount={activities.length}
    />
  );
}
