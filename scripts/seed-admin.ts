import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth/password";
import { getDb } from "../lib/db";
import { users } from "../lib/db/schema";
import { getOrCreateSettings } from "../lib/db/settings";

config({ path: ".env.local" });

async function seedAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required");
  }
  if (password.length < 8) {
    throw new Error("BOOTSTRAP_ADMIN_PASSWORD must be at least 8 characters");
  }

  await getOrCreateSettings();

  const db = getDb();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    email,
    passwordHash,
    role: "admin",
    status: "active",
    emailVerified: new Date(),
  });
  console.log(`Created admin: ${email}`);
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
