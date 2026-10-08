"use client";

import { useState } from "react";
import {
  addCardAction,
  deleteCardAction,
  generateCardPreviewAction,
  requestAudioAction,
} from "@/app/app/actions";
import { GeneratedBadge, SpeakerButton } from "@/components/app/speaker-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GeneratedCard } from "@/lib/flashcard/schema";

type SavedCard = {
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
type AudioKindKey = "word" | (typeof EXAMPLE_KINDS)[number];

export function AddCardForm({ deckId }: { deckId: string }) {
  const [word, setWord] = useState("");
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<GeneratedCard | null>(null);
  const [inputText, setInputText] = useState("");
  const [saved, setSaved] = useState<SavedCard | null>(null);
  const [voiceBusy, setVoiceBusy] = useState<AudioKindKey | null>(null);
  const [voiceError, setVoiceError] = useState<{ target: AudioKindKey; message: string } | null>(null);

  const display = saved
    ? {
        word: saved.word,
        partOfSpeech: saved.partOfSpeech,
        transcription: saved.transcription,
        irregularForms: saved.irregularForms,
        examples: saved.examples,
        definition: saved.definition,
      }
    : preview;

  async function discardWorkingCard() {
    if (!saved) {
      return;
    }
    await deleteCardAction({ flashcardId: saved.id, deckId });
    setSaved(null);
  }

  async function onGenerate(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setVoiceError(null);
    try {
      await discardWorkingCard();
      const result = await generateCardPreviewAction({ word });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPreview(result.card);
      setInputText(result.inputText);
      setWord("");
    } finally {
      setPending(false);
    }
  }

  async function ensureSavedCard(): Promise<SavedCard | null> {
    if (saved) {
      return saved;
    }
    if (!preview) {
      return null;
    }
    const result = await addCardAction({
      deckId,
      word: inputText || preview.word,
      data: preview,
    });
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    const next = result.card as SavedCard;
    setSaved(next);
    return next;
  }

  async function onAddCard() {
    if (!display) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (!saved) {
        const created = await ensureSavedCard();
        if (!created) {
          return;
        }
      }
      setPreview(null);
      setSaved(null);
      setInputText("");
      setWord("");
      setVoiceError(null);
    } finally {
      setSaving(false);
    }
  }

  async function generateVoice(kind: AudioKindKey) {
    setVoiceBusy(kind);
    setVoiceError(null);
    setError(null);
    try {
      const card = await ensureSavedCard();
      if (!card) {
        return;
      }
      const result = await requestAudioAction({ flashcardId: card.id, kind });
      if (!result.ok) {
        setVoiceError({ target: kind, message: result.error });
        return;
      }
      setSaved((current) =>
        current ? { ...current, audio: { ...current.audio, ...result.audio } } : current,
      );
    } finally {
      setVoiceBusy(null);
    }
  }

  const head = display?.irregularForms || display?.word;
  const wordGenerated = Boolean(saved?.audio.word);

  return (
    <div className="space-y-6">
      <form onSubmit={(event) => void onGenerate(event)} className="flex flex-col gap-3 sm:flex-row">
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
          {display ? (
            <div className="space-y-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold">
                    {head}
                    {display.partOfSpeech ? ` (${display.partOfSpeech})` : ""}
                  </p>
                  <p className="mt-1 text-white/55">{display.transcription}</p>
                </div>
                {wordGenerated && saved ? (
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <SpeakerButton flashcardId={saved.id} kind="word" url={saved.audio.word} generateOnPlay={false} />
                    <GeneratedBadge />
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={voiceBusy !== null || saving}
                    onClick={() => void generateVoice("word")}
                    className="h-8 shrink-0 rounded-full border-white/15 bg-transparent px-3 text-xs text-white hover:bg-white/10"
                  >
                    {voiceBusy === "word" ? "Generating…" : "Generate audio"}
                  </Button>
                )}
              </div>
              {voiceError?.target === "word" ? (
                <p className="text-xs text-red-300">{voiceError.message}</p>
              ) : null}

              <div className="space-y-2">
                <ol className="space-y-2 text-sm leading-6 text-white/80">
                  {display.examples.map((example, index) => {
                    const kind = EXAMPLE_KINDS[index];
                    if (!kind) {
                      return null;
                    }
                    const generated = Boolean(saved?.audio[kind]);
                    return (
                      <li key={`${kind}-${example}`} className="flex items-start justify-between gap-3">
                        <span className="min-w-0 flex-1">
                          {index + 1}. {example}
                        </span>
                        {generated && saved ? (
                          <span className="flex shrink-0 flex-col items-end gap-1">
                            <SpeakerButton
                              flashcardId={saved.id}
                              kind={kind}
                              url={saved.audio[kind]}
                              generateOnPlay={false}
                            />
                            <GeneratedBadge />
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={voiceBusy !== null || saving}
                            onClick={() => void generateVoice(kind)}
                            className="h-8 shrink-0 rounded-full border-white/15 bg-transparent px-3 text-xs text-white hover:bg-white/10"
                          >
                            {voiceBusy === kind ? "Generating…" : "Generate audio"}
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ol>
                {voiceError && voiceError.target !== "word" ? (
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
          {display?.definition ? (
            <p className="text-white/85">{display.definition}</p>
          ) : (
            <p className="min-h-24 text-white/30">Enter text here.</p>
          )}
        </section>
      </div>

      {display ? (
        <div className="flex justify-end">
          <Button
            type="button"
            disabled={saving || voiceBusy !== null}
            onClick={() => void onAddCard()}
            className="h-11 bg-[#3d8bff] px-6 text-white hover:bg-[#2f7af0]"
          >
            {saving ? "Saving…" : "Add card"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
