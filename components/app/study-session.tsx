"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewCardAction } from "@/app/app/actions";
import { SpeakerButton } from "@/components/app/speaker-button";
import type { ReviewRating } from "@/lib/db/schema";

type StudyCard = {
  id: string;
  word: string;
  partOfSpeech: string | null;
  transcription: string | null;
  irregularForms: string | null;
  examples: string[];
  definition: string | null;
  audio: Record<string, string>;
  intervals?: Record<ReviewRating, string>;
};

const RATINGS: { id: ReviewRating; label: string; className: string }[] = [
  { id: "again", label: "Again", className: "bg-[#5c3a32] text-[#f3c0b4]" },
  { id: "hard", label: "Hard", className: "bg-[#4d4a2c] text-[#e6e0a8]" },
  { id: "good", label: "Good", className: "bg-[#2f4a38] text-[#b7e0c2]" },
  { id: "easy", label: "Easy", className: "bg-[#2c3d5c] text-[#b7c8e8]" },
];

export function StudySession({
  deckName,
  cards,
}: {
  deckName: string;
  cards: StudyCard[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const card = cards[index];
  const total = cards.length;

  if (!card) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
        <p className="text-xl font-medium">You are done for now</p>
        <p className="mt-2 text-white/50">No more cards due in this deck.</p>
      </div>
    );
  }

  const head = card.irregularForms || card.word;
  const progress = ((index + (revealed ? 1 : 0)) / total) * 100;

  async function rate(rating: ReviewRating) {
    setBusy(true);
    await reviewCardAction({ flashcardId: card.id, rating });
    setBusy(false);
    if (index + 1 >= total) {
      router.push("/app");
      router.refresh();
      return;
    }
    setIndex((value) => value + 1);
    setRevealed(false);
  }

  return (
    <div
      className="relative min-h-[calc(100dvh-3.5rem)] bg-cover bg-center px-4 py-6"
      style={{ backgroundImage: "url(/app/study-map.jpg), linear-gradient(180deg,#1a140e,#0c0c0c)" }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-lg font-medium">{deckName}</p>
          <p className="text-sm text-white/55">
            {index + 1}/{total}
          </p>
        </div>
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-black/40">
          <div className="h-full bg-emerald-400" style={{ width: `${Math.max(progress, 8)}%` }} />
        </div>

        <article
          className="relative min-h-[320px] rounded-2xl border border-white/10 bg-[#2a241c]/80 p-8 shadow-2xl backdrop-blur-sm"
          style={{ backgroundImage: "url(/app/card-parchment.jpg)", backgroundSize: "cover" }}
        >
          <div className="absolute inset-0 rounded-2xl bg-black/45" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold">
                  {head}
                  {card.partOfSpeech ? ` (${card.partOfSpeech})` : ""}
                </p>
                <p className="mt-2 text-white/70">{card.transcription}</p>
              </div>
              <SpeakerButton flashcardId={card.id} kind="word" url={card.audio.word} />
            </div>

            {revealed ? (
              <div className="mt-8 space-y-5">
                <ol className="space-y-3 text-base leading-7 text-white/90">
                  {card.examples.map((example, exampleIndex) => (
                    <li key={example} className="flex items-start justify-between gap-3">
                      <span>
                        {exampleIndex + 1}. {example}
                      </span>
                      <SpeakerButton
                        flashcardId={card.id}
                        kind={`example_${exampleIndex + 1}` as "example_1"}
                        url={card.audio[`example_${exampleIndex + 1}`]}
                      />
                    </li>
                  ))}
                </ol>
                <hr className="border-white/15" />
                <p className="text-white/90">
                  {card.partOfSpeech ? `(${card.partOfSpeech}) ` : ""}
                  {card.definition}
                </p>
              </div>
            ) : null}
          </div>
        </article>

        <div className="mt-8 flex justify-center">
          {revealed ? (
            <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {RATINGS.map((rating) => (
                <button
                  key={rating.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void rate(rating.id)}
                  className={`rounded-xl px-3 py-3 ${rating.className}`}
                >
                  <span className="block text-sm font-semibold">{rating.label}</span>
                  <span className="block text-xs opacity-80">{card.intervals?.[rating.id] ?? ""}</span>
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-xl bg-white px-10 py-3 text-sm font-semibold text-black"
            >
              Tap to show answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
