// lib/db.ts
// ─── Prisma 7 singleton client ───────────────────────────────────────────────
//
// Prisma 7 breaking change: the connection URL is no longer read from
// schema.prisma. Instead you must:
//   1. Pass an adapter to PrismaClient that holds the connection.
//   2. Import PrismaClient from the GENERATED output path, not @prisma/client.
//
// Generated path: app/generated/prisma  (set in prisma/schema.prisma)
// Adapter: @prisma/adapter-pg  →  PrismaPg({ connectionString: ... })
//
// In Next.js development the module is hot-reloaded on every change.
// Without the globalThis guard you'd accumulate hundreds of PrismaClient
// instances and exhaust the connection pool.  The guard is the canonical
// Next.js + Prisma pattern: see https://www.prisma.io/docs/guides/nextjs
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ── Validate env at startup ───────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  throw new Error(
    "[lib/db] DATABASE_URL environment variable is not set. " +
      "Add it to your .env or .env.local file."
  );
}

// ── Client factory ────────────────────────────────────────────────────────────
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

// ── Singleton via globalThis (dev hot-reload safe) ────────────────────────────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
