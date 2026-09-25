import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { flashcardAudio, flashcards, type AudioKind, type Flashcard } from "@/lib/db/schema";
import { formatFlashcardText, stripDuplicatePosPrefix } from "@/lib/flashcard/format";
import { generatedCardSchema, type GeneratedCard } from "@/lib/flashcard/schema";
import { cardPayload } from "@/lib/flashcard/create";

export type UpdateFlashcardInput = GeneratedCard;

function audioKindsToClear(previous: GeneratedCard | null, next: GeneratedCard): AudioKind[] {
  const kinds: AudioKind[] = [];
  if (!previous || previous.word !== next.word) {
    kinds.push("word");
  }
  for (let index = 0; index < 3; index += 1) {
    if (!previous || previous.examples[index] !== next.examples[index]) {
      kinds.push(`example_${index + 1}` as AudioKind);
    }
  }
  return kinds;
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
  const clearKinds = audioKindsToClear(cardPayload(existing), card);

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

  if (clearKinds.length) {
    await db
      .delete(flashcardAudio)
      .where(and(eq(flashcardAudio.flashcardId, row.id), inArray(flashcardAudio.kind, clearKinds)));
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
