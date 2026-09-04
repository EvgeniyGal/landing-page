import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const { parsed } = config({ path: ".env.local", override: true });
const url = parsed?.DATABASE_URL || process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is missing. Save it in .env.local inside double quotes, then rerun npm run db:migrate.",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});
