"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AUDIO_KINDS, audioPlaybackPath, getOrCreateAudio, parseAudioKind } from "@/lib/flashcard/audio";
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

export async function requestAudioAction(input: { flashcardId: string; kind?: string; kinds?: string[] }) {
  const user = await requireLearner();
  const requested = input.kinds?.length ? input.kinds : input.kind ? [input.kind] : [];
  const kinds: (typeof AUDIO_KINDS)[number][] = [];
  for (const value of requested) {
    const parsed = parseAudioKind(value);
    if (!parsed) {
      return { ok: false as const, error: "Invalid audio kind." };
    }
    if (parsed === "all_examples") {
      kinds.push(...AUDIO_KINDS.filter((item) => item !== "word"));
    } else {
      kinds.push(parsed);
    }
  }
  const uniqueKinds = [...new Set(kinds)];
  if (!uniqueKinds.length) {
    return { ok: false as const, error: "Select at least one clip." };
  }
  const urls: Record<string, string> = {};
  try {
    for (const item of uniqueKinds) {
      const result = await getOrCreateAudio({
        userId: user.id,
        flashcardId: input.flashcardId,
        kind: item,
      });
      if (!result.ok) {
        const error =
          result.message ||
          (result.reason === "tts_not_configured"
            ? "Voice is not configured yet."
            : result.reason === "voice_restricted"
              ? "This ElevenLabs voice needs a paid plan. Set ELEVENLABS_VOICE_ID to a Default voice from your account."
              : "Could not generate audio.");
        return { ok: false as const, error };
      }
      urls[item] = audioPlaybackPath(input.flashcardId, item);
    }
    return { ok: true as const, audio: urls };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not generate audio.",
    };
  }
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
