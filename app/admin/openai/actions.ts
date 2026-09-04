"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { decryptSecret, encryptSecret, last4 } from "@/lib/crypto/encryption";
import { getDb } from "@/lib/db";
import { APP_SETTINGS_ID, appSettings } from "@/lib/db/schema";
import { getOrCreateSettings } from "@/lib/db/settings";
import { listChatModels } from "@/lib/openai/generate";

const keySchema = z.string().min(16);
const modelSchema = z.string().min(1).max(128);

export async function saveOpenaiKeyAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const parsed = keySchema.safeParse(String(formData.get("apiKey") ?? "").trim());
  if (!parsed.success) {
    return { error: "Enter a valid OpenAI API key." };
  }

  try {
    const models = await listChatModels(parsed.data);
    if (!models.length) {
      return { error: "The key works, but no chat models were returned." };
    }
    const db = getDb();
    const settings = await getOrCreateSettings();
    const nextModel = settings.openaiModel && models.includes(settings.openaiModel) ? settings.openaiModel : models[0];
    await db
      .update(appSettings)
      .set({
        encryptedOpenaiApiKey: encryptSecret(parsed.data),
        openaiApiKeyLast4: last4(parsed.data),
        openaiModel: nextModel,
        updatedAt: new Date(),
      })
      .where(eq(appSettings.id, APP_SETTINGS_ID));
    revalidatePath("/admin/openai");
    return { success: "API key saved. Select a model below." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not validate the OpenAI key." };
  }
}

export async function saveOpenaiModelAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const parsed = modelSchema.safeParse(String(formData.get("model") ?? "").trim());
  if (!parsed.success) {
    return { error: "Select a model." };
  }

  const db = getDb();
  await getOrCreateSettings();
  await db
    .update(appSettings)
    .set({
      openaiModel: parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(appSettings.id, APP_SETTINGS_ID));
  revalidatePath("/admin/openai");
  return { success: `Using ${parsed.data}.` };
}

export async function loadOpenaiModels() {
  await requireAdmin();
  const settings = await getOrCreateSettings();
  if (!settings.encryptedOpenaiApiKey) {
    return [] as string[];
  }
  try {
    return await listChatModels(decryptSecret(settings.encryptedOpenaiApiKey));
  } catch {
    return [] as string[];
  }
}
