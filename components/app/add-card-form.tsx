"use client";

import { useState } from "react";
import { createCardAction } from "@/app/app/actions";
import { SpeakerButton } from "@/components/app/speaker-button";
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

export function AddCardForm({ deckId }: { deckId: string }) {
  const [word, setWord] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<SerializedCard | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await createCardAction({ deckId, word });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCard(result.card as SerializedCard);
    setWord("");
  }

  const head = card?.irregularForms || card?.word;

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
            <div className="space-y-3 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold">
                    {head}
                    {card.partOfSpeech ? ` (${card.partOfSpeech})` : ""}
                  </p>
                  <p className="mt-1 text-white/55">{card.transcription}</p>
                </div>
                <SpeakerButton flashcardId={card.id} kind="word" url={card.audio.word} />
              </div>
              <ol className="space-y-2 text-sm leading-6 text-white/80">
                {card.examples.map((example, index) => (
                  <li key={example} className="flex items-start justify-between gap-3">
                    <span>
                      {index + 1}. {example}
                    </span>
                    <SpeakerButton
                      flashcardId={card.id}
                      kind={`example_${index + 1}` as "example_1"}
                      url={card.audio[`example_${index + 1}`]}
                    />
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="min-h-32 text-white/30">Enter text here.</p>
          )}
        </section>
        <section className="border-t border-white/8 pt-4">
          <p className="mb-2 text-sm text-white/45">Back side</p>
          {card?.definition ? (
            <p className="text-white/85">
              {card.partOfSpeech ? `(${card.partOfSpeech}) ` : ""}
              {card.definition}
            </p>
          ) : (
            <p className="min-h-24 text-white/30">Enter text here.</p>
          )}
        </section>
      </div>
    </div>
  );
}
