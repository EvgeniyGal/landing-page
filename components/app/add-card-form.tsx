"use client";

import { useState } from "react";
import { createCardAction, requestAudioAction } from "@/app/app/actions";
import { GeneratedBadge, SpeakerButton } from "@/components/app/speaker-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SerializedCard = {
  id: string;
  word: string;
  partOfSpeech: string | null;
  transcription: string | null;
  irregularForms: string | null;
  examples: string[];
  definition: string | null;
  audio: Record<string, string>;
};

const EXAMPLE_KINDS = ["example_1", "example_2", "example_3"] as const;
type ExampleKind = (typeof EXAMPLE_KINDS)[number];

export function AddCardForm({ deckId }: { deckId: string }) {
  const [word, setWord] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<SerializedCard | null>(null);
  const [selectedExamples, setSelectedExamples] = useState<ExampleKind[]>([]);
  const [voiceBusy, setVoiceBusy] = useState<"word" | "examples" | null>(null);
  const [voiceError, setVoiceError] = useState<{ target: "word" | "examples"; message: string } | null>(
    null,
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setVoiceError(null);
    const result = await createCardAction({ deckId, word });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCard(result.card as SerializedCard);
    setSelectedExamples([]);
    setWord("");
  }

  function toggleExample(kind: ExampleKind) {
    setSelectedExamples((current) =>
      current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind],
    );
  }

  async function generateWordVoice() {
    if (!card) {
      return;
    }
    setVoiceBusy("word");
    setVoiceError(null);
    const result = await requestAudioAction({ flashcardId: card.id, kind: "word" });
    setVoiceBusy(null);
    if (!result.ok) {
      setVoiceError({ target: "word", message: result.error });
      return;
    }
    setCard((current) => (current ? { ...current, audio: { ...current.audio, ...result.audio } } : current));
  }

  async function generateSelectedExamples() {
    if (!card || selectedExamples.length === 0) {
      return;
    }
    const kinds = selectedExamples.filter((kind) => !card.audio[kind]);
    if (!kinds.length) {
      return;
    }
    setVoiceBusy("examples");
    setVoiceError(null);
    const result = await requestAudioAction({ flashcardId: card.id, kinds });
    setVoiceBusy(null);
    if (!result.ok) {
      setVoiceError({ target: "examples", message: result.error });
      return;
    }
    setCard((current) => (current ? { ...current, audio: { ...current.audio, ...result.audio } } : current));
    setSelectedExamples((current) => current.filter((kind) => !kinds.includes(kind)));
  }

  const head = card?.irregularForms || card?.word;
  const wordGenerated = Boolean(card?.audio.word);
  const pendingExampleCount = selectedExamples.filter((kind) => !card?.audio[kind]).length;

  return (
    <div className="space-y-6">
      <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={word}
          onChange={(event) => setWord(event.target.value)}
          placeholder="Word, jump-verb, or a phrase"
          className="h-12 border-white/10 bg-[#141414] text-white placeholder:text-white/35"
        />
        <Button type="submit" disabled={pending} className="h-12 bg-[#3d8bff] px-6 text-white hover:bg-[#2f7af0]">
          {pending ? "Generating…" : "Generate"}
        </Button>
      </form>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="space-y-4 rounded-2xl bg-[#1a1a1a] p-5">
        <section>
          <p className="mb-2 text-sm text-white/45">Front side</p>
          {card ? (
            <div className="space-y-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold">
                    {head}
                    {card.partOfSpeech ? ` (${card.partOfSpeech})` : ""}
                  </p>
                  <p className="mt-1 text-white/55">{card.transcription}</p>
                </div>
                {wordGenerated ? (
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <SpeakerButton flashcardId={card.id} kind="word" url={card.audio.word} generateOnPlay={false} />
                    <GeneratedBadge />
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={voiceBusy !== null}
                    onClick={() => void generateWordVoice()}
                    className="h-8 shrink-0 rounded-full border-white/15 bg-transparent px-3 text-xs text-white hover:bg-white/10"
                  >
                    {voiceBusy === "word" ? "Generating…" : "Generate"}
                  </Button>
                )}
              </div>
              {voiceError?.target === "word" ? (
                <p className="text-xs text-red-300">{voiceError.message}</p>
              ) : null}

              <div className="space-y-2">
                <ol className="space-y-2 text-sm leading-6 text-white/80">
                  {card.examples.map((example, index) => {
                    const kind = EXAMPLE_KINDS[index];
                    if (!kind) {
                      return null;
                    }
                    const generated = Boolean(card.audio[kind]);
                    const selected = selectedExamples.includes(kind);
                    return (
                      <li key={example} className="flex items-start justify-between gap-3">
                        {generated ? (
                          <span>
                            {index + 1}. {example}
                          </span>
                        ) : (
                          <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selected}
                              disabled={voiceBusy !== null}
                              onChange={() => toggleExample(kind)}
                              className="mt-1.5 size-4 shrink-0 accent-[#3d8bff]"
                            />
                            <span>
                              {index + 1}. {example}
                            </span>
                          </label>
                        )}
                        {generated ? (
                          <span className="flex shrink-0 flex-col items-end gap-1">
                            <SpeakerButton
                              flashcardId={card.id}
                              kind={kind}
                              url={card.audio[kind]}
                              generateOnPlay={false}
                            />
                            <GeneratedBadge />
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
                {EXAMPLE_KINDS.some((kind) => !card.audio[kind]) ? (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={voiceBusy !== null || pendingExampleCount === 0}
                      onClick={() => void generateSelectedExamples()}
                      className="h-8 rounded-full border-white/15 bg-transparent px-3 text-xs text-white hover:bg-white/10"
                    >
                      {voiceBusy === "examples"
                        ? "Generating…"
                        : pendingExampleCount > 1
                          ? `Generate (${pendingExampleCount})`
                          : "Generate"}
                    </Button>
                  </div>
                ) : null}
                {voiceError?.target === "examples" ? (
                  <p className="text-right text-xs text-red-300">{voiceError.message}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="min-h-32 text-white/30">Enter text here.</p>
          )}
        </section>
        <section className="border-t border-white/8 pt-4">
          <p className="mb-2 text-sm text-white/45">Back side</p>
          {card?.definition ? (
            <p className="text-white/85">{card.definition}</p>
          ) : (
            <p className="min-h-24 text-white/30">Enter text here.</p>
          )}
        </section>
      </div>
    </div>
  );
}
