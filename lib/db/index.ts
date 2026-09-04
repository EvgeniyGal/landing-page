import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing required env var: DATABASE_URL");
  }
  return drizzle({ client: neon(url), schema });
}

export type Database = ReturnType<typeof getDb>;
