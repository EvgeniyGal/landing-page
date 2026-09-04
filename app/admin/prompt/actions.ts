"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db";
import { APP_SETTINGS_ID, appSettings } from "@/lib/db/schema";
import { getOrCreateSettings } from "@/lib/db/settings";

const promptSchema = z.string().min(20).max(20000);

export async function savePromptAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const parsed = promptSchema.safeParse(String(formData.get("prompt") ?? ""));
  if (!parsed.success) {
    return { error: "Prompt must be at least 20 characters." };
  }

  const db = getDb();
  await getOrCreateSettings();
  await db
    .update(appSettings)
    .set({
      flashcardPrompt: parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(appSettings.id, APP_SETTINGS_ID));
  revalidatePath("/admin/prompt");
  return { success: "Prompt saved." };
}
