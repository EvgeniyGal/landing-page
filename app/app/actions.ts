import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AUDIO_KINDS, getOrCreateAudio, parseAudioKind } from "@/lib/flashcard/audio";
import { createFlashcardForUser } from "@/lib/flashcard/create";
import { serializeFlashcard } from "@/lib/api/serialize";
import { reviewCard } from "@/lib/srs/review";
import type { ReviewRating } from "@/lib/db/schema";

async function requireLearner() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

export async function createCardAction(input: { deckId: string; word: string }) {
  const user = await requireLearner();
  const word = input.word.trim();
  if (!word) {
    return { ok: false as const, error: "Enter a word or phrase." };
  }
  try {
    const result = await createFlashcardForUser({
      userId: user.id,
      word,
      deckId: input.deckId,
    });
    if (!result.ok) {
      return { ok: false as const, error: "Flashcard generation is not configured yet." };
    }
    return { ok: true as const, card: serializeFlashcard(result.flashcard) };
  } catch {
    return { ok: false as const, error: "Could not generate a flashcard right now." };
  }
}

export async function requestAudioAction(input: { flashcardId: string; kind: string }) {
  const user = await requireLearner();
  const kind = parseAudioKind(input.kind);
  if (!kind) {
    return { ok: false as const, error: "Invalid audio kind." };
  }
  const kinds = kind === "all_examples" ? AUDIO_KINDS.filter((item) => item !== "word") : [kind];
  const urls: Record<string, string> = {};
  for (const item of kinds) {
    const result = await getOrCreateAudio({
      userId: user.id,
      flashcardId: input.flashcardId,
      kind: item,
    });
    if (!result.ok) {
      const error =
        result.reason === "tts_not_configured"
          ? "Voice is not configured yet."
          : "Could not generate audio.";
      return { ok: false as const, error };
    }
    urls[item] = result.url;
  }
  return { ok: true as const, audio: urls };
}

export async function reviewCardAction(input: { flashcardId: string; rating: ReviewRating }) {
  const user = await requireLearner();
  const result = await reviewCard({
    userId: user.id,
    flashcardId: input.flashcardId,
    rating: input.rating,
  });
  if (!result.ok) {
    return { ok: false as const, error: "Card not found." };
  }
  return { ok: true as const };
}
