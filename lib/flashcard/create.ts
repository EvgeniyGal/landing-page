import { decryptSecret } from "@/lib/crypto/encryption";
import { getDb } from "@/lib/db";
import { flashcards } from "@/lib/db/schema";
import { getOrCreateSettings } from "@/lib/db/settings";
import { getDeckForUser, getOrCreateDefaultDeck } from "@/lib/flashcard/decks";
import { formatFlashcardText } from "@/lib/flashcard/format";
import { generateFlashcardContent } from "@/lib/openai/generate";
import { newCardSchedule } from "@/lib/srs/sm2";
import type { GeneratedCard } from "@/lib/flashcard/schema";
import type { Flashcard } from "@/lib/db/schema";

export async function createFlashcardForUser(input: {
  userId: string;
  word: string;
  deckId?: string;
}) {
  const settings = await getOrCreateSettings();
  if (!settings.encryptedOpenaiApiKey || !settings.openaiModel || !settings.flashcardPrompt.trim()) {
    return { ok: false as const, reason: "not_configured" as const };
  }

  const deck = input.deckId
    ? await getDeckForUser(input.userId, input.deckId)
    : await getOrCreateDefaultDeck(input.userId);
  if (!deck) {
    return { ok: false as const, reason: "deck_not_found" as const };
  }

  const apiKey = decryptSecret(settings.encryptedOpenaiApiKey);
  const card = await generateFlashcardContent({
    apiKey,
    model: settings.openaiModel,
    prompt: settings.flashcardPrompt,
    word: input.word,
  });
  const outputText = formatFlashcardText(card);
  const schedule = newCardSchedule();

  const db = getDb();
  const [row] = await db
    .insert(flashcards)
    .values({
      userId: input.userId,
      deckId: deck.id,
      inputText: input.word,
      outputText,
      word: card.word,
      partOfSpeech: card.partOfSpeech,
      transcription: card.transcription,
      irregularForms: card.irregularForms,
      examples: card.examples,
      definition: card.definition,
      state: schedule.state,
      stepIndex: schedule.stepIndex,
      ease: schedule.ease,
      intervalDays: schedule.intervalDays,
      dueAt: schedule.dueAt,
      lapses: schedule.lapses,
      reps: schedule.reps,
      model: settings.openaiModel,
      promptSnapshot: settings.flashcardPrompt,
    })
    .returning();

  return { ok: true as const, outputText, flashcard: row, card };
}

export function cardPayload(row: Flashcard): GeneratedCard | null {
  const examples = Array.isArray(row.examples) ? row.examples : [];
  if (!row.word || !row.transcription || !row.definition || examples.length !== 3) {
    return null;
  }
  return {
    word: row.word,
    partOfSpeech: row.partOfSpeech,
    transcription: row.transcription,
    irregularForms: row.irregularForms,
    examples,
    definition: row.definition,
  };
}
