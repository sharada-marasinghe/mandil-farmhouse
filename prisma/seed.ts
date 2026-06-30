import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Error: DATABASE_URL is not set in .env.local");
  process.exit(1);
}

// Instantiate the Prisma client with the Postgres adapter
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@mandilfarmhouse.com";
  const plaintextPassword = "0779911825Asd";
  const phoneNumber = "0779911825";

  console.log(`[Seed] Hashing password for user "${email}"...`);
  const passwordHash = await bcrypt.hash(plaintextPassword, 10);

  console.log(`[Seed] Upserting user into database...`);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      name: "Administrator",
      role: "SUPER_ADMIN",
      phoneNumber,
    },
    create: {
      email,
      password: passwordHash,
      name: "Administrator",
      role: "SUPER_ADMIN",
      phoneNumber,
    },
  });

  console.log(`[Seed] Superadmin user initialized: ${user.email} (ID: ${user.id})`);

  console.log(`[Seed] Seeding sample amenities...`);
  const amenitiesToSeed = [
    {
      name: "Luxury Pontoon Boat",
      price: 15000,
      billingType: "PER_HOUR" as const,
    },
    {
      name: "BBQ Machine & Charcoal Setup",
      price: 3500,
      billingType: "FLAT_RATE" as const,
    },
    {
      name: "JBL PartyBox Speaker",
      price: 3000,
      billingType: "PER_DAY" as const,
    },
  ];

  for (const amenity of amenitiesToSeed) {
    const record = await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {
        price: amenity.price,
        billingType: amenity.billingType,
      },
      create: {
        name: amenity.name,
        price: amenity.price,
        billingType: amenity.billingType,
      },
    });
    console.log(` - Amenity upserted: ${record.name} (${record.price} LKR, ${record.billingType})`);
  }

  console.log(`[Seed] Seeding sample activities...`);
  const activitiesToSeed = [
    {
      name: "Lake Fishing Hooks & Bait",
      description: "Spend a relaxing afternoon fishing on the waters of Bolgoda Lake. Standard fishing rods, high-quality hooks, and fresh bait are provided. Perfect for family relaxation.",
    },
    {
      name: "Jet Ski Ride",
      description: "Feel the rush of adrenaline on a high-speed jet ski adventure across Bolgoda Lake. Life jackets and professional safety briefs are provided.",
    },
  ];

  for (const activity of activitiesToSeed) {
    const record = await prisma.activity.upsert({
      where: { name: activity.name },
      update: {
        description: activity.description,
      },
      create: {
        name: activity.name,
        description: activity.description,
      },
    });
    console.log(` - Activity upserted: ${record.name}`);
  }

  console.log(`[Seed] Seeding complete!`);
}

main()
  .catch((e) => {
    console.error("[Seed] Error executing seeding script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
