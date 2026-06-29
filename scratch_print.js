require('dotenv').config({ path: './.env.local' });
const { PrismaClient } = require('./app/generated/prisma');
const { PrismaPg } = require('./node_modules/@prisma/adapter-pg');

const databaseUrl = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const pkgs = await prisma.package.findMany();
  console.log("Database Packages:", JSON.stringify(pkgs, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
