import { db } from "@/lib/db";
import AssetsClient from "./AssetsClient";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const amenities = await db.amenity.findMany({ orderBy: { name: "asc" } });
  const serialized = amenities.map((a) => ({ ...a, price: a.price.toNumber() }));
  return <AssetsClient initialAmenities={serialized} />;
}
