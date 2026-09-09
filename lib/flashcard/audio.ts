import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { flashcardAudio, flashcards, type AudioKind } from "@/lib/db/schema";
import { cardPayload } from "@/lib/flashcard/create";
import { isTtsConfigured, synthesizeSpeech, TtsError } from "@/lib/elevenlabs/tts";
import { putAudioBlob } from "@/lib/storage/blob";

export function audioPlaybackPath(flashcardId: string, kind: AudioKind) {
  return `/api/audio/${flashcardId}/${kind}`;
}

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
}): Promise<
  | { ok: true; url: string; kind: AudioKind; created: boolean }
  | { ok: false; reason: "tts_not_configured" | "not_found" | "no_text" | "tts_failed" | "voice_restricted"; message?: string }
> {
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

  let bytes: Buffer;
  try {
    bytes = await synthesizeSpeech(text);
  } catch (error) {
    if (error instanceof TtsError) {
      return { ok: false as const, reason: error.reason, message: error.message };
    }
    return {
      ok: false as const,
      reason: "tts_failed" as const,
      message: error instanceof Error ? error.message : "Could not generate audio.",
    };
  }

  let blobUrl: string;
  try {
    blobUrl = await putAudioBlob({
      userId: input.userId,
      cardId: card.id,
      kind: input.kind,
      bytes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not store audio.";
    console.error("putAudioBlob failed", message);
    return {
      ok: false as const,
      reason: "tts_failed" as const,
      message: `Could not store audio. Check BLOB_READ_WRITE_TOKEN. ${message}`,
    };
  }

  const [stored] = await db
    .insert(flashcardAudio)
    .values({
      flashcardId: card.id,
      kind: input.kind,
      blobUrl,
      contentType: "audio/mpeg",
    })
    .onConflictDoUpdate({
      target: [flashcardAudio.flashcardId, flashcardAudio.kind],
      set: { blobUrl, contentType: "audio/mpeg" },
    })
    .returning();

  if (!stored) {
    return {
      ok: false as const,
      reason: "tts_failed" as const,
      message: "Audio was uploaded but could not be saved.",
    };
  }

  return { ok: true as const, url: stored.blobUrl, kind: input.kind, created: true };
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
