import { eq } from "drizzle-orm";
import { DEFAULT_FLASHCARD_PROMPT } from "@/lib/flashcard/default-prompt";
import { getDb } from "./index";
import { APP_SETTINGS_ID, appSettings, type AppSettings } from "./schema";

export async function getOrCreateSettings(): Promise<AppSettings> {
  const db = getDb();
  const existing = await db.query.appSettings.findFirst({
    where: eq(appSettings.id, APP_SETTINGS_ID),
  });
  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(appSettings)
    .values({
      id: APP_SETTINGS_ID,
      flashcardPrompt: DEFAULT_FLASHCARD_PROMPT,
    })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return created;
  }

  const afterConflict = await db.query.appSettings.findFirst({
    where: eq(appSettings.id, APP_SETTINGS_ID),
  });
  if (!afterConflict) {
    throw new Error("Failed to load application settings");
  }
  return afterConflict;
}
