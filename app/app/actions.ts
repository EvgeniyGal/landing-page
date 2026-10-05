"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AUDIO_KINDS, audioPlaybackPath, deleteFlashcardAudio, getOrCreateAudio, parseAudioKind } from "@/lib/flashcard/audio";
import { createFlashcardForUser } from "@/lib/flashcard/create";
import { createDeckForUser, deleteDeckForUser } from "@/lib/flashcard/decks";
import { deleteFlashcardForUser, updateFlashcardForUser } from "@/lib/flashcard/mutate";
import { serializeFlashcard } from "@/lib/api/serialize";
import { reviewCard } from "@/lib/srs/review";
import type { ReviewRating } from "@/lib/db/schema";
import type { GeneratedCard } from "@/lib/flashcard/schema";
import { revalidatePath } from "next/cache";

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

export async function requestAudioAction(input: {
  flashcardId: string;
  kind?: string;
  kinds?: string[];
  force?: boolean;
}) {
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
        force: input.force,
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

export async function deleteAudioAction(input: {
  flashcardId: string;
  deckId: string;
  kind?: string;
  kinds?: string[];
}) {
  const user = await requireLearner();
  const requested = input.kinds?.length ? input.kinds : input.kind ? [input.kind] : [];
  const kinds: (typeof AUDIO_KINDS)[number][] = [];
  for (const value of requested) {
    const parsed = parseAudioKind(value);
    if (!parsed || parsed === "all_examples") {
      if (parsed === "all_examples") {
        kinds.push(...AUDIO_KINDS.filter((item) => item !== "word"));
        continue;
      }
      return { ok: false as const, error: "Invalid audio kind." };
    }
    kinds.push(parsed);
  }
  const uniqueKinds = [...new Set(kinds)];
  if (!uniqueKinds.length) {
    return { ok: false as const, error: "Select at least one clip." };
  }
  const result = await deleteFlashcardAudio({
    userId: user.id,
    flashcardId: input.flashcardId,
    kinds: uniqueKinds,
  });
  if (!result.ok) {
    return { ok: false as const, error: "Card not found." };
  }
  revalidatePath(`/app/decks/${input.deckId}`);
  revalidatePath(`/app/decks/${input.deckId}/cards/${input.flashcardId}/edit`);
  return { ok: true as const, removed: uniqueKinds };
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
  const card = serializeFlashcard(result.card, { intervals: true });
  revalidatePath("/app");
  revalidatePath(`/app/decks/${result.card.deckId}`);
  revalidatePath(`/app/decks/${result.card.deckId}/study`);
  return { ok: true as const, card };
}

export async function updateCardAction(input: {
  flashcardId: string;
  deckId: string;
  data: GeneratedCard;
}) {
  const user = await requireLearner();
  const result = await updateFlashcardForUser({
    userId: user.id,
    flashcardId: input.flashcardId,
    data: input.data,
  });
  if (!result.ok) {
    return {
      ok: false as const,
      error: result.reason === "not_found" ? "Card not found." : "Check the card fields and try again.",
    };
  }
  revalidatePath(`/app/decks/${input.deckId}`);
  revalidatePath(`/app/decks/${input.deckId}/cards/${input.flashcardId}/edit`);
  return { ok: true as const, card: serializeFlashcard(result.flashcard) };
}

export async function deleteCardAction(input: { flashcardId: string; deckId: string }) {
  const user = await requireLearner();
  const result = await deleteFlashcardForUser({
    userId: user.id,
    flashcardId: input.flashcardId,
  });
  if (!result.ok) {
    return { ok: false as const, error: "Card not found." };
  }
  revalidatePath(`/app/decks/${input.deckId}`);
  revalidatePath("/app");
  return { ok: true as const };
}

export async function createDeckAction(input: { name: string }) {
  const user = await requireLearner();
  const result = await createDeckForUser({
    userId: user.id,
    name: input.name,
  });
  if (!result.ok) {
    return { ok: false as const, error: "Enter a dictionary name." };
  }
  revalidatePath("/app");
  return {
    ok: true as const,
    deck: {
      id: result.deck.id,
      name: result.deck.name,
      isDefault: result.deck.isDefault,
    },
  };
}

export async function deleteDeckAction(input: { deckId: string }) {
  const user = await requireLearner();
  const result = await deleteDeckForUser({
    userId: user.id,
    deckId: input.deckId,
  });
  if (!result.ok) {
    return { ok: false as const, error: "Dictionary not found." };
  }
  revalidatePath("/app");
  revalidatePath(`/app/decks/${input.deckId}`);
  return { ok: true as const };
}
