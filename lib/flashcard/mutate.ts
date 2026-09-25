import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { flashcardAudio, flashcards, type Flashcard } from "@/lib/db/schema";
import { formatFlashcardText, stripDuplicatePosPrefix } from "@/lib/flashcard/format";
import { generatedCardSchema, type GeneratedCard } from "@/lib/flashcard/schema";
import { cardPayload } from "@/lib/flashcard/create";

export type UpdateFlashcardInput = GeneratedCard;

function spokenFieldsChanged(previous: GeneratedCard | null, next: GeneratedCard) {
  if (!previous) {
    return true;
  }
  if (previous.word !== next.word) {
    return true;
  }
  return previous.examples.some((example, index) => example !== next.examples[index]);
}

export async function getFlashcardForUser(userId: string, flashcardId: string) {
  const db = getDb();
  return db.query.flashcards.findFirst({
    where: and(eq(flashcards.id, flashcardId), eq(flashcards.userId, userId)),
    with: { audio: true },
  });
}

export async function updateFlashcardForUser(input: {
  userId: string;
  flashcardId: string;
  data: UpdateFlashcardInput;
}): Promise<{ ok: true; flashcard: Flashcard } | { ok: false; reason: "not_found" | "invalid" }> {
  const parsed = generatedCardSchema.safeParse(input.data);
  if (!parsed.success) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const db = getDb();
  const existing = await db.query.flashcards.findFirst({
    where: and(eq(flashcards.id, input.flashcardId), eq(flashcards.userId, input.userId)),
  });
  if (!existing) {
    return { ok: false as const, reason: "not_found" as const };
  }

  const card: GeneratedCard = {
    ...parsed.data,
    definition: stripDuplicatePosPrefix(parsed.data.definition, parsed.data.partOfSpeech),
  };
  const outputText = formatFlashcardText(card);
  const clearAudio = spokenFieldsChanged(cardPayload(existing), card);

  const [row] = await db
    .update(flashcards)
    .set({
      inputText: card.word,
      outputText,
      word: card.word,
      partOfSpeech: card.partOfSpeech,
      transcription: card.transcription,
      irregularForms: card.irregularForms,
      examples: card.examples,
      definition: card.definition,
    })
    .where(and(eq(flashcards.id, input.flashcardId), eq(flashcards.userId, input.userId)))
    .returning();

  if (!row) {
    return { ok: false as const, reason: "not_found" as const };
  }

  if (clearAudio) {
    await db.delete(flashcardAudio).where(eq(flashcardAudio.flashcardId, row.id));
  }

  return { ok: true as const, flashcard: row };
}

export async function deleteFlashcardForUser(input: {
  userId: string;
  flashcardId: string;
}): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
  const db = getDb();
  const deleted = await db
    .delete(flashcards)
    .where(and(eq(flashcards.id, input.flashcardId), eq(flashcards.userId, input.userId)))
    .returning({ id: flashcards.id });

  if (!deleted.length) {
    return { ok: false as const, reason: "not_found" as const };
  }
  return { ok: true as const };
}
