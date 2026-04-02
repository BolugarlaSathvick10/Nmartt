import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const createTableSql = `
CREATE TABLE IF NOT EXISTS "AuthCredential" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL UNIQUE,
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthCredential_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
)`;

const seedSql = `
ALTER TABLE "AuthCredential"
  ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

INSERT INTO "AuthCredential" ("id", "userId", "email", "password", "createdAt", "updatedAt")
VALUES
  ('cred-admin-1', 'admin-1', 'admin@nmart.com', 'admin123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cred-pm-1', 'pm-1', 'pm@nmart.com', 'pm123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cred-db-1', 'db-1', 'delivery@nmart.com', 'delivery123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cred-u1', 'u1', 'user@nmart.com', 'user123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING
`;

try {
  await prisma.$executeRawUnsafe(createTableSql);
  await prisma.$executeRawUnsafe(seedSql);
  console.log('bootstrapped auth credentials');
} finally {
  await prisma.$disconnect();
  await pool.end();
}
