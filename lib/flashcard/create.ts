import { decryptSecret } from "@/lib/crypto/encryption";
import { getDb } from "@/lib/db";
import { flashcards } from "@/lib/db/schema";
import { getOrCreateSettings } from "@/lib/db/settings";
import { getDeckForUser, getOrCreateDefaultDeck } from "@/lib/flashcard/decks";
import { formatFlashcardText, stripDuplicatePosPrefix } from "@/lib/flashcard/format";
import { generateFlashcardContent } from "@/lib/openai/generate";
import { newCardSchedule } from "@/lib/srs/sm2";
import type { GeneratedCard } from "@/lib/flashcard/schema";
import type { Flashcard } from "@/lib/db/schema";

async function requireGenerationSettings() {
  const settings = await getOrCreateSettings();
  if (!settings.encryptedOpenaiApiKey || !settings.openaiModel || !settings.flashcardPrompt.trim()) {
    return null;
  }
  return settings;
}

export async function generateFlashcardPreviewForUser(input: {
  word: string;
}): Promise<{ ok: true; card: GeneratedCard } | { ok: false; reason: "not_configured" }> {
  const settings = await requireGenerationSettings();
  if (!settings) {
    return { ok: false as const, reason: "not_configured" as const };
  }

  const apiKey = decryptSecret(settings.encryptedOpenaiApiKey!);
  const card = await generateFlashcardContent({
    apiKey,
    model: settings.openaiModel!,
    prompt: settings.flashcardPrompt,
    word: input.word,
  });
  return { ok: true as const, card };
}

export async function createFlashcardFromContentForUser(input: {
  userId: string;
  word: string;
  deckId?: string;
  card: GeneratedCard;
  model?: string | null;
  promptSnapshot?: string | null;
}): Promise<
  | { ok: true; outputText: string; flashcard: Flashcard; card: GeneratedCard }
  | { ok: false; reason: "deck_not_found" | "not_configured" }
> {
  const deck = input.deckId
    ? await getDeckForUser(input.userId, input.deckId)
    : await getOrCreateDefaultDeck(input.userId);
  if (!deck) {
    return { ok: false as const, reason: "deck_not_found" as const };
  }

  const card: GeneratedCard = {
    ...input.card,
    definition: stripDuplicatePosPrefix(input.card.definition, input.card.partOfSpeech),
  };
  const outputText = formatFlashcardText(card);
  const schedule = newCardSchedule();
  const settings = await getOrCreateSettings();
  const model = input.model ?? settings.openaiModel;
  const promptSnapshot = input.promptSnapshot ?? settings.flashcardPrompt;
  if (!model || !promptSnapshot.trim()) {
    return { ok: false as const, reason: "not_configured" as const };
  }

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
      model,
      promptSnapshot,
    })
    .returning();

  return { ok: true as const, outputText, flashcard: row, card };
}

export async function createFlashcardForUser(input: {
  userId: string;
  word: string;
  deckId?: string;
}) {
  const settings = await requireGenerationSettings();
  if (!settings) {
    return { ok: false as const, reason: "not_configured" as const };
  }

  const preview = await generateFlashcardPreviewForUser({ word: input.word });
  if (!preview.ok) {
    return preview;
  }

  return createFlashcardFromContentForUser({
    userId: input.userId,
    word: input.word,
    deckId: input.deckId,
    card: preview.card,
    model: settings.openaiModel,
    promptSnapshot: settings.flashcardPrompt,
  });
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
