import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { flashcardAudio, flashcards, type AudioKind } from "@/lib/db/schema";
import { cardPayload } from "@/lib/flashcard/create";
import { isTtsConfigured, synthesizeSpeech } from "@/lib/elevenlabs/tts";
import { putAudioBlob } from "@/lib/storage/blob";

export const AUDIO_KINDS: AudioKind[] = ["word", "example_1", "example_2", "example_3"];

export function parseAudioKind(value: string): AudioKind | "all_examples" | null {
  if (value === "all_examples") {
    return "all_examples";
  }
  if (AUDIO_KINDS.includes(value as AudioKind)) {
    return value as AudioKind;
  }
  return null;
}

function textForKind(card: NonNullable<ReturnType<typeof cardPayload>>, kind: AudioKind) {
  if (kind === "word") {
    return card.word;
  }
  const index = Number(kind.replace("example_", "")) - 1;
  return card.examples[index] ?? "";
}

export async function getOrCreateAudio(input: {
  userId: string;
  flashcardId: string;
  kind: AudioKind;
}) {
  if (!isTtsConfigured()) {
    return { ok: false as const, reason: "tts_not_configured" as const };
  }

  const db = getDb();
  const card = await db.query.flashcards.findFirst({
    where: and(eq(flashcards.id, input.flashcardId), eq(flashcards.userId, input.userId)),
  });
  if (!card) {
    return { ok: false as const, reason: "not_found" as const };
  }

  const existing = await db.query.flashcardAudio.findFirst({
    where: and(eq(flashcardAudio.flashcardId, card.id), eq(flashcardAudio.kind, input.kind)),
  });
  if (existing) {
    return { ok: true as const, url: existing.blobUrl, kind: input.kind, created: false };
  }

  const payload = cardPayload(card);
  const text = payload ? textForKind(payload, input.kind) : input.kind === "word" ? card.inputText : "";
  if (!text.trim()) {
    return { ok: false as const, reason: "no_text" as const };
  }

  const bytes = await synthesizeSpeech(text);
  const blobUrl = await putAudioBlob({
    userId: input.userId,
    cardId: card.id,
    kind: input.kind,
    bytes,
  });

  await db
    .insert(flashcardAudio)
    .values({
      flashcardId: card.id,
      kind: input.kind,
      blobUrl,
      contentType: "audio/mpeg",
    })
    .onConflictDoNothing();

  const stored = await db.query.flashcardAudio.findFirst({
    where: and(eq(flashcardAudio.flashcardId, card.id), eq(flashcardAudio.kind, input.kind)),
  });

  return { ok: true as const, url: stored?.blobUrl ?? blobUrl, kind: input.kind, created: true };
}

export async function getOrCreateAudioBatch(input: {
  userId: string;
  flashcardId: string;
  kinds: AudioKind[];
}) {
  const items = [];
  for (const kind of input.kinds) {
    const result = await getOrCreateAudio({ ...input, kind });
    items.push({ kind, result });
  }
  return items;
}
