// prisma.config.ts  — Prisma 7 configuration (replaces datasource url in schema.prisma)
// Connection URL is read here and also passed directly to PrismaClient via lib/db.ts.

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
