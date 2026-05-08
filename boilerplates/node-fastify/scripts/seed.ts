/**
 * Seed script — populates the database with development data.
 * Run: npx tsx scripts/seed.ts
 */
import "dotenv/config";
import { pool, db } from "../src/app/core/database.js";
import { users, refreshTokens } from "../src/app/repositories/drizzle/schema.js";
import { hashPassword } from "../src/app/core/security.js";

async function seed() {
  console.log("Seeding database...");

  // Clean existing data (dev only)
  await db.delete(refreshTokens);
  await db.delete(users);

  const seedUsers = [
    { username: "admin", email: "admin@example.com", password: "password123", role: "admin" },
    { username: "alice", email: "alice@example.com", password: "password123", role: "user" },
    { username: "bob", email: "bob@example.com", password: "password123", role: "user" },
  ] as const;

  for (const u of seedUsers) {
    const hashedPassword = await hashPassword(u.password);
    await db.insert(users).values({
      username: u.username,
      email: u.email,
      hashedPassword,
      role: u.role,
    });
    console.log(`  Created: ${u.email} / ${u.password} (role: ${u.role})`);
  }

  console.log("Done.");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
