import { db } from "@/lib/db";
import PackagesClient from "./PackagesClient";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const [packages, amenities, activities] = await Promise.all([
    db.package.findMany({ orderBy: { name: "asc" } }),
    db.amenity.findMany({ orderBy: { name: "asc" } }),
    db.activity.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serialized = packages.map((pkg) => ({
    ...pkg,
    basePrice: pkg.basePrice.toNumber(),
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt.toISOString(),
  }));

  const serializedAmenities = amenities.map((a) => ({
    ...a,
    price: a.price.toNumber(),
  }));

  return (
    <PackagesClient
      initialPackages={serialized}
      amenities={serializedAmenities}
      activities={activities}
    />
  );
}
