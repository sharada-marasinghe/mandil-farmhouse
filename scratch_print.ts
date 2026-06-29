import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

import { db } from "./lib/db";

async function main() {
  const pkgs = await db.package.findMany();
  console.log("Database Packages:", JSON.stringify(pkgs, null, 2));
}

main().finally(() => db.$disconnect());
