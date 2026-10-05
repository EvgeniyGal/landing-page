"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { reviewCardAction } from "@/app/app/actions";
import { SpeakerButton } from "@/components/app/speaker-button";
import type { ReviewRating } from "@/lib/db/schema";
import {
  advanceStudyQueue,
  dueTimestamp,
  formatWaitLabel,
  splitDueQueue,
} from "@/lib/srs/queue";
import type { CardState } from "@/lib/srs/sm2";

type StudyCard = {
  id: string;
  word: string;
  partOfSpeech: string | null;
  transcription: string | null;
  irregularForms: string | null;
  examples: string[];
  definition: string | null;
  state: CardState;
  dueAt: string;
  audio: Record<string, string>;
  intervals?: Record<ReviewRating, string>;
};

type RevealStep = "front" | "examples" | "answer";

const STEP_PROGRESS: Record<RevealStep, number> = {
  front: 0,
  examples: 0.5,
  answer: 1,
};

const RATINGS: { id: ReviewRating; label: string; className: string }[] = [
  { id: "again", label: "Again", className: "bg-[#5c3a32] text-[#f3c0b4]" },
  { id: "hard", label: "Hard", className: "bg-[#4d4a2c] text-[#e6e0a8]" },
  { id: "good", label: "Good", className: "bg-[#2f4a38] text-[#b7e0c2]" },
  { id: "easy", label: "Easy", className: "bg-[#2c3d5c] text-[#b7c8e8]" },
];

function nextStep(step: RevealStep): RevealStep {
  if (step === "front") {
    return "examples";
  }
  if (step === "examples") {
    return "answer";
  }
  return "answer";
}

export function StudySession({
  deckName,
  cards: initialCards,
}: {
  deckName: string;
  cards: StudyCard[];
}) {
  const router = useRouter();
  const [queue, setQueue] = useState(initialCards);
  const [step, setStep] = useState<RevealStep>("front");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [initialCount] = useState(initialCards.length);

  const { due, waiting } = splitDueQueue(queue, now);
  const card = due[0];
  const nextWaiting = waiting[0];
  const remainingCount = queue.length;

  useEffect(() => {
    if (card || !nextWaiting) {
      return;
    }
    const delay = Math.max(250, dueTimestamp(nextWaiting.dueAt) - Date.now());
    const timer = window.setTimeout(() => setNow(Date.now()), delay);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(tick);
    };
  }, [card, nextWaiting]);

  if (!card && !nextWaiting) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
        <p className="text-xl font-medium">You are done for now</p>
        <p className="mt-2 text-white/50">No more cards due in this deck.</p>
      </div>
    );
  }

  if (!card && nextWaiting) {
    const waitMs = Math.max(0, dueTimestamp(nextWaiting.dueAt) - now);
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
        <p className="text-xl font-medium">Next card in {formatWaitLabel(waitMs)}</p>
        <p className="mt-2 text-white/50">
          Learning step for “{nextWaiting.irregularForms || nextWaiting.word}”
        </p>
        <p className="mt-6 text-sm text-white/40">
          {remainingCount} card{remainingCount === 1 ? "" : "s"} left in this session
        </p>
      </div>
    );
  }

  const head = card.irregularForms || card.word;
  const reviewed = initialCount - remainingCount;
  const progress = ((reviewed + STEP_PROGRESS[step]) / Math.max(initialCount, 1)) * 100;
  const showExamples = step === "examples" || step === "answer";
  const showAnswer = step === "answer";

  function advanceReveal() {
    setStep((current) => nextStep(current));
  }

  async function rate(rating: ReviewRating) {
    setBusy(true);
    const result = await reviewCardAction({ flashcardId: card.id, rating });
    setBusy(false);
    if (!result.ok) {
      return;
    }

    const updated: StudyCard = {
      ...card,
      state: result.card.state,
      dueAt: result.card.dueAt,
      intervals: result.card.intervals,
    };
    const nextQueue = advanceStudyQueue(queue, updated);
    setQueue(nextQueue);
    setStep("front");
    setNow(Date.now());

    if (nextQueue.length === 0) {
      router.push("/app");
      router.refresh();
    }
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
            {remainingCount} left
          </p>
        </div>
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-black/40">
          <div className="h-full bg-emerald-400" style={{ width: `${Math.max(progress, 8)}%` }} />
        </div>

        <article
          role={showAnswer ? undefined : "button"}
          tabIndex={showAnswer ? undefined : 0}
          onClick={showAnswer ? undefined : advanceReveal}
          onKeyDown={
            showAnswer
              ? undefined
              : (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    advanceReveal();
                  }
                }
          }
          className="relative min-h-[320px] rounded-2xl border border-white/10 bg-[#2a241c]/80 p-8 shadow-2xl backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
              {card.audio.word ? (
                <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                  <SpeakerButton flashcardId={card.id} kind="word" url={card.audio.word} generateOnPlay={false} />
                </span>
              ) : null}
            </div>

            {showExamples ? (
              <div className="mt-8 space-y-5">
                <ol className="space-y-3 text-base leading-7 text-white/90">
                  {card.examples.map((example, exampleIndex) => {
                    const kind = `example_${exampleIndex + 1}` as "example_1" | "example_2" | "example_3";
                    const url = card.audio[kind];
                    return (
                      <li key={example} className="flex items-start justify-between gap-3">
                        <span>
                          {exampleIndex + 1}. {example}
                        </span>
                        {url ? (
                          <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                            <SpeakerButton
                              flashcardId={card.id}
                              kind={kind}
                              url={url}
                              generateOnPlay={false}
                            />
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
                {showAnswer ? (
                  <>
                    <hr className="border-white/15" />
                    <p className="text-white/90">{card.definition}</p>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>

        <div className="mt-8 flex justify-center">
          {showAnswer ? (
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
              onClick={advanceReveal}
              className="rounded-xl bg-white px-10 py-3 text-sm font-semibold text-black"
            >
              {step === "front" ? "Tap to show examples" : "Tap to show answer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
