import { PrismaClient } from "../app/generated/prisma";
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
  const username = "admin";
  const plaintextPassword = "0779911825Asd";

  console.log(`[Seed] Hashing password for user "${username}"...`);
  const passwordHash = await bcrypt.hash(plaintextPassword, 10);

  console.log(`[Seed] Upserting user into database...`);
  const user = await prisma.user.upsert({
    where: { username },
    update: {
      password: passwordHash,
      name: "Administrator",
      role: "admin",
    },
    create: {
      username,
      password: passwordHash,
      name: "Administrator",
      role: "admin",
    },
  });

  console.log(`[Seed] Superadmin user initialized: ${user.username} (ID: ${user.id})`);
}

main()
  .catch((e) => {
    console.error("[Seed] Error executing seeding script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
