"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteAudioAction, requestAudioAction, updateCardAction } from "@/app/app/actions";
import { GeneratedBadge, SpeakerButton } from "@/components/app/speaker-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { stripDuplicatePosPrefix } from "@/lib/flashcard/format";

export type EditableCard = {
  id: string;
  word: string;
  partOfSpeech: string | null;
  transcription: string | null;
  irregularForms: string | null;
  examples: string[];
  definition: string;
  audio: Record<string, string>;
};

const EXAMPLE_KINDS = ["example_1", "example_2", "example_3"] as const;
type AudioKindKey = "word" | (typeof EXAMPLE_KINDS)[number];

type Draft = {
  word: string;
  partOfSpeech: string;
  transcription: string;
  irregularForms: string;
  examples: [string, string, string];
  definition: string;
};

function toDraft(card: EditableCard): Draft {
  const examples = [...card.examples];
  while (examples.length < 3) {
    examples.push("");
  }
  return {
    word: card.word,
    partOfSpeech: card.partOfSpeech ?? "",
    transcription: card.transcription ?? "",
    irregularForms: card.irregularForms ?? "",
    examples: [examples[0] ?? "", examples[1] ?? "", examples[2] ?? ""],
    definition: stripDuplicatePosPrefix(card.definition, card.partOfSpeech),
  };
}

function PronunciationControls({
  flashcardId,
  kind,
  url,
  busy,
  disabled,
  onGenerate,
  onRemove,
}: {
  flashcardId: string;
  kind: AudioKindKey;
  url?: string;
  busy: boolean;
  disabled?: boolean;
  onGenerate: (force: boolean) => void;
  onRemove: () => void;
}) {
  if (url) {
    return (
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="flex items-center gap-2">
          <SpeakerButton flashcardId={flashcardId} kind={kind} url={url} generateOnPlay={false} />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || disabled}
            onClick={() => onGenerate(true)}
            className="h-8 rounded-full border-white/15 bg-transparent px-3 text-xs text-white hover:bg-white/10"
          >
            {busy ? "…" : "Regen"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy || disabled}
            onClick={onRemove}
            className="h-8 px-2 text-xs text-white/50 hover:bg-red-500/15 hover:text-red-200"
          >
            Remove
          </Button>
        </span>
        <GeneratedBadge />
      </span>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={busy || disabled}
      onClick={() => onGenerate(false)}
      className="h-8 shrink-0 rounded-full border-white/15 bg-transparent px-3 text-xs text-white hover:bg-white/10"
    >
      {busy ? "Generating…" : "Generate audio"}
    </Button>
  );
}

export function EditCardForm({
  deckId,
  deckName,
  initialCard,
}: {
  deckId: string;
  deckName: string;
  initialCard: EditableCard;
}) {
  const [draft, setDraft] = useState(() => toDraft(initialCard));
  const [audio, setAudio] = useState(initialCard.audio);
  const [savedSnapshot, setSavedSnapshot] = useState(() => toDraft(initialCard));
  const [error, setError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceBusy, setVoiceBusy] = useState<AudioKindKey | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(savedSnapshot), [draft, savedSnapshot]);

  const staleWord = draft.word.trim() !== savedSnapshot.word.trim() && Boolean(audio.word);
  const staleExamples = EXAMPLE_KINDS.map((kind, index) => ({
    kind,
    stale: draft.examples[index]?.trim() !== savedSnapshot.examples[index]?.trim() && Boolean(audio[kind]),
  }));

  function onSave() {
    setError(null);
    setVoiceError(null);
    const payload = {
      word: draft.word.trim(),
      partOfSpeech: draft.partOfSpeech.trim() || null,
      transcription: draft.transcription.trim(),
      irregularForms: draft.irregularForms.trim() || null,
      examples: draft.examples.map((example) => example.trim()) as [string, string, string],
      definition: draft.definition.trim(),
    };
    startTransition(async () => {
      const result = await updateCardAction({
        flashcardId: initialCard.id,
        deckId,
        data: payload,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const nextDraft = toDraft({
        id: initialCard.id,
        word: result.card.word,
        partOfSpeech: result.card.partOfSpeech,
        transcription: result.card.transcription,
        irregularForms: result.card.irregularForms,
        examples: result.card.examples,
        definition: result.card.definition,
        audio: result.card.audio,
      });
      // Prefer keeping the definition the user typed (without POS wrapper).
      nextDraft.definition = payload.definition;
      setDraft(nextDraft);
      setSavedSnapshot(nextDraft);
      setAudio(result.card.audio);
    });
  }

  async function generateVoice(kinds: AudioKindKey[], force: boolean) {
    setVoiceBusy(kinds[0] ?? null);
    setVoiceError(null);
    const result = await requestAudioAction({
      flashcardId: initialCard.id,
      kinds,
      force,
    });
    setVoiceBusy(null);
    if (!result.ok) {
      setVoiceError(result.error);
      return;
    }
    setAudio((current) => ({ ...current, ...result.audio }));
  }

  async function removeVoice(kinds: AudioKindKey[]) {
    setVoiceBusy(kinds[0] ?? null);
    setVoiceError(null);
    const result = await deleteAudioAction({
      flashcardId: initialCard.id,
      deckId,
      kinds,
    });
    setVoiceBusy(null);
    if (!result.ok) {
      setVoiceError(result.error);
      return;
    }
    setAudio((current) => {
      const next = { ...current };
      for (const kind of kinds) {
        delete next[kind];
      }
      return next;
    });
  }

  const head = draft.irregularForms.trim() || draft.word.trim() || "Card";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/45">
          Editing in{" "}
          <Link href={`/app/decks/${deckId}`} className="text-white hover:underline">
            {deckName}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending || !dirty}
            onClick={onSave}
            className="bg-[#3d8bff] text-white hover:bg-[#2f7af0]"
          >
            {pending ? "Updating…" : "Update"}
          </Button>
          <Button
            type="button"
            variant="outline"
            asChild
            className="border-white/15 bg-transparent text-white hover:bg-white/5"
          >
            <Link href={`/app/decks/${deckId}`}>Back to deck</Link>
          </Button>
        </div>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {dirty ? (
        <p className="text-xs text-amber-200/80">
          You have unsaved text changes. Save before generating pronunciation for edited lines.
        </p>
      ) : null}

      <div className="space-y-4 rounded-2xl bg-[#1a1a1a] p-5">
        <section className="space-y-4">
          <p className="text-sm text-white/45">Front side</p>
          <div className="flex items-start justify-between gap-3">
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs text-white/45">
                Word
                <Input
                  value={draft.word}
                  onChange={(event) => setDraft({ ...draft, word: event.target.value })}
                  className="border-white/10 bg-[#141414] text-white"
                />
              </label>
              <label className="space-y-1.5 text-xs text-white/45">
                Part of speech
                <Input
                  value={draft.partOfSpeech}
                  onChange={(event) => setDraft({ ...draft, partOfSpeech: event.target.value })}
                  className="border-white/10 bg-[#141414] text-white"
                />
              </label>
              <label className="space-y-1.5 text-xs text-white/45">
                Transcription
                <Input
                  value={draft.transcription}
                  onChange={(event) => setDraft({ ...draft, transcription: event.target.value })}
                  className="border-white/10 bg-[#141414] text-white"
                />
              </label>
              <label className="space-y-1.5 text-xs text-white/45">
                Irregular forms
                <Input
                  value={draft.irregularForms}
                  onChange={(event) => setDraft({ ...draft, irregularForms: event.target.value })}
                  placeholder="go/went/gone"
                  className="border-white/10 bg-[#141414] text-white placeholder:text-white/30"
                />
              </label>
            </div>
            <div className="pt-6">
              <PronunciationControls
                flashcardId={initialCard.id}
                kind="word"
                url={audio.word}
                busy={voiceBusy === "word"}
                disabled={pending || draft.word.trim() !== savedSnapshot.word.trim()}
                onGenerate={(force) => void generateVoice(["word"], force)}
                onRemove={() => void removeVoice(["word"])}
              />
              {staleWord ? <p className="mt-1 text-[11px] text-amber-200/80">Save word text first</p> : null}
            </div>
          </div>
          <p className="text-sm text-white/55">
            Preview: <span className="text-white">{head}</span>
            {draft.partOfSpeech.trim() ? ` (${draft.partOfSpeech.trim()})` : ""}
          </p>

          <div className="space-y-3">
            {draft.examples.map((example, index) => {
              const kind = EXAMPLE_KINDS[index];
              if (!kind) {
                return null;
              }
              const exampleDirty = draft.examples[index]?.trim() !== savedSnapshot.examples[index]?.trim();
              const stale = staleExamples[index]?.stale;
              return (
                <div key={kind} className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-white/45">
                      <span>Example {index + 1}</span>
                      {exampleDirty ? <span className="text-amber-200/80">save text first</span> : null}
                      {stale && !exampleDirty ? <span className="text-amber-200/80">outdated audio</span> : null}
                    </div>
                    <Textarea
                      value={example}
                      rows={2}
                      onChange={(event) => {
                        const examples = [...draft.examples] as [string, string, string];
                        examples[index] = event.target.value;
                        setDraft({ ...draft, examples });
                      }}
                      className="min-h-20 border-white/10 bg-[#141414] text-white"
                    />
                  </div>
                  <div className="pt-6">
                    <PronunciationControls
                      flashcardId={initialCard.id}
                      kind={kind}
                      url={audio[kind]}
                      busy={voiceBusy === kind}
                      disabled={pending || exampleDirty}
                      onGenerate={(force) => void generateVoice([kind], force)}
                      onRemove={() => void removeVoice([kind])}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-2 border-t border-white/8 pt-4">
          <p className="text-sm text-white/45">Back side</p>
          <label className="block space-y-1.5 text-xs text-white/45">
            Definition
            <Textarea
              value={draft.definition}
              rows={3}
              onChange={(event) => setDraft({ ...draft, definition: event.target.value })}
              className="min-h-24 border-white/10 bg-[#141414] text-white"
            />
          </label>
        </section>
      </div>

      {voiceError ? <p className="text-sm text-red-300">{voiceError}</p> : null}
    </div>
  );
}
