import { db } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch initial packages
  const packages = await db.package.findMany({
    orderBy: { name: "asc" },
  });

  // Fetch initial bookings along with their activity logs and packages
  const bookings = await db.booking.findMany({
    include: {
      package: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          pricingModel: true,
        },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimal objects to numbers so they can be passed as JSON to the client component safely
  const serializedPackages = packages.map((pkg) => ({
    ...pkg,
    basePrice: pkg.basePrice.toNumber(),
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt.toISOString(),
  }));

  const serializedBookings = bookings.map((booking) => ({
    ...booking,
    totalPrice: booking.totalPrice.toNumber(),
    bookingDate: booking.bookingDate.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    package: {
      ...booking.package,
      basePrice: booking.package.basePrice.toNumber(),
    },
    activityLogs: booking.activityLogs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })),
  }));

  return (
    <DashboardClient
      initialBookings={serializedBookings}
      packages={serializedPackages}
    />
  );
}
