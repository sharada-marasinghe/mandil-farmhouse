import { db } from "@/lib/db";
import ActivitiesClient from "./ActivitiesClient";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const activities = await db.activity.findMany({ orderBy: { name: "asc" } });
  return <ActivitiesClient initialActivities={activities} />;
}
