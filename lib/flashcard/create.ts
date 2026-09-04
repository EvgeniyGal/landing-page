import { decryptSecret } from "@/lib/crypto/encryption";
import { getDb } from "@/lib/db";
import { flashcards } from "@/lib/db/schema";
import { getOrCreateSettings } from "@/lib/db/settings";
import { generateFlashcardContent } from "@/lib/openai/generate";

export async function createFlashcardForUser(input: { userId: string; word: string }) {
  const settings = await getOrCreateSettings();
  if (!settings.encryptedOpenaiApiKey || !settings.openaiModel || !settings.flashcardPrompt.trim()) {
    return { ok: false as const, reason: "not_configured" as const };
  }

  const apiKey = decryptSecret(settings.encryptedOpenaiApiKey);
  const outputText = await generateFlashcardContent({
    apiKey,
    model: settings.openaiModel,
    prompt: settings.flashcardPrompt,
    word: input.word,
  });

  const db = getDb();
  await db.insert(flashcards).values({
    userId: input.userId,
    inputText: input.word,
    outputText,
    model: settings.openaiModel,
    promptSnapshot: settings.flashcardPrompt,
  });

  return { ok: true as const, outputText };
}
