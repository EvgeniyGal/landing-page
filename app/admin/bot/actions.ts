"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { encryptSecret, last4 } from "@/lib/crypto/encryption";
import { getDb } from "@/lib/db";
import { APP_SETTINGS_ID, appSettings } from "@/lib/db/schema";
import { getOrCreateSettings } from "@/lib/db/settings";
import { validateAndRegisterBot } from "@/lib/telegram/api";

const tokenSchema = z.string().min(20);

export async function saveBotTokenAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const parsed = tokenSchema.safeParse(String(formData.get("token") ?? "").trim());
  if (!parsed.success) {
    return { error: "Enter a valid Telegram bot token." };
  }

  try {
    const bot = await validateAndRegisterBot(parsed.data);
    const db = getDb();
    await getOrCreateSettings();
    await db
      .update(appSettings)
      .set({
        encryptedTelegramBotToken: encryptSecret(parsed.data),
        telegramBotTokenLast4: last4(parsed.data),
        telegramBotUsername: bot.username,
        updatedAt: new Date(),
      })
      .where(eq(appSettings.id, APP_SETTINGS_ID));
    revalidatePath("/admin/bot");
    return { success: bot.username ? `Connected @${bot.username}.` : "Bot connected." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not connect the bot." };
  }
}
