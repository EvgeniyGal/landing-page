import type { Flashcard, FlashcardAudio } from "@/lib/db/schema";
import { formatBackDefinition } from "@/lib/flashcard/format";
import { audioPlaybackPath } from "@/lib/flashcard/audio";
import { cardPayload } from "@/lib/flashcard/create";
import { ratingPreview } from "@/lib/srs/review";

export function serializeFlashcard(
  card: Flashcard & { audio?: FlashcardAudio[] },
  options?: { intervals?: boolean },
) {
  const payload = cardPayload(card);
  const audio = Object.fromEntries(
    (card.audio ?? []).map((item) => [item.kind, audioPlaybackPath(card.id, item.kind)]),
  );
  return {
    id: card.id,
    deckId: card.deckId,
    inputText: card.inputText,
    outputText: card.outputText,
    word: payload?.word ?? card.word ?? card.inputText,
    partOfSpeech: payload?.partOfSpeech ?? card.partOfSpeech,
    transcription: payload?.transcription ?? card.transcription,
    irregularForms: payload?.irregularForms ?? card.irregularForms,
    examples: payload?.examples ?? card.examples ?? [],
    definition: formatBackDefinition(
      payload?.definition ?? card.definition ?? "",
      payload?.partOfSpeech ?? card.partOfSpeech,
    ),
    state: card.state,
    dueAt: card.dueAt.toISOString(),
    ease: card.ease,
    intervalDays: card.intervalDays,
    audio,
    intervals: options?.intervals ? ratingPreview(card) : undefined,
  };
}
