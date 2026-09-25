"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteCardAction, updateCardAction } from "@/app/app/actions";
import { SpeakerButton } from "@/components/app/speaker-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { stripDuplicatePosPrefix } from "@/lib/flashcard/format";

export type DeckCardItem = {
  id: string;
  word: string;
  partOfSpeech: string | null;
  transcription: string | null;
  irregularForms: string | null;
  examples: string[];
  definition: string;
  stateLabel: string;
  stateClassName: string;
  audioWordUrl?: string;
};

type EditDraft = {
  word: string;
  partOfSpeech: string;
  transcription: string;
  irregularForms: string;
  examples: [string, string, string];
  definition: string;
};

function toDraft(card: DeckCardItem): EditDraft {
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

export function DeckCardList({ deckId, cards }: { deckId: string; cards: DeckCardItem[] }) {
  const [items, setItems] = useState(cards);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const editingCard = useMemo(
    () => items.find((card) => card.id === editingId) ?? null,
    [editingId, items],
  );

  function startEdit(card: DeckCardItem) {
    setError(null);
    setEditingId(card.id);
    setDraft(toDraft(card));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setError(null);
  }

  function onSave() {
    if (!editingId || !draft) {
      return;
    }
    const partOfSpeech = draft.partOfSpeech.trim() || null;
    const irregularForms = draft.irregularForms.trim() || null;
    const payload = {
      word: draft.word.trim(),
      partOfSpeech,
      transcription: draft.transcription.trim(),
      irregularForms,
      examples: draft.examples.map((example) => example.trim()) as [string, string, string],
      definition: draft.definition.trim(),
    };
    startTransition(async () => {
      const result = await updateCardAction({
        flashcardId: editingId,
        deckId,
        data: payload,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItems((current) =>
        current.map((card) =>
          card.id === editingId
            ? {
                ...card,
                word: result.card.word,
                partOfSpeech: result.card.partOfSpeech,
                transcription: result.card.transcription,
                irregularForms: result.card.irregularForms,
                examples: result.card.examples,
                definition: result.card.definition,
                audioWordUrl: result.card.audio.word,
              }
            : card,
        ),
      );
      cancelEdit();
    });
  }

  function onDelete(card: DeckCardItem) {
    const confirmed = window.confirm(`Delete “${card.irregularForms || card.word}”?`);
    if (!confirmed) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCardAction({ flashcardId: card.id, deckId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItems((current) => current.filter((item) => item.id !== card.id));
      if (editingId === card.id) {
        cancelEdit();
      }
    });
  }

  if (items.length === 0) {
    return (
      <ul className="overflow-hidden rounded-2xl bg-[#1a1a1a]">
        <li className="px-5 py-10 text-sm text-white/45">No cards in this deck yet.</li>
      </ul>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl bg-[#1a1a1a]">
      {items.map((card, index) => {
        const isEditing = editingId === card.id && draft;
        return (
          <li key={card.id} className={index > 0 ? "border-t border-white/8" : undefined}>
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{card.irregularForms || card.word}</p>
                <p className="truncate text-sm text-white/45">{card.definition}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs ${card.stateClassName}`}>{card.stateLabel}</span>
              {card.audioWordUrl ? (
                <SpeakerButton
                  flashcardId={card.id}
                  kind="word"
                  url={card.audioWordUrl}
                  generateOnPlay={false}
                />
              ) : null}
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={pending}
                  aria-label={`Edit ${card.word}`}
                  onClick={() => (isEditing ? cancelEdit() : startEdit(card))}
                  className="size-8 text-white/55 hover:bg-white/10 hover:text-white"
                >
                  {isEditing ? <X className="size-4" /> : <Pencil className="size-4" />}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={pending}
                  aria-label={`Delete ${card.word}`}
                  onClick={() => onDelete(card)}
                  className="size-8 text-white/55 hover:bg-red-500/15 hover:text-red-200"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            {isEditing && draft ? (
              <div className="space-y-3 border-t border-white/8 bg-[#141414] px-5 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs text-white/45">
                    Word
                    <Input
                      value={draft.word}
                      onChange={(event) => setDraft({ ...draft, word: event.target.value })}
                      className="border-white/10 bg-[#0c0c0c] text-white"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-white/45">
                    Part of speech
                    <Input
                      value={draft.partOfSpeech}
                      onChange={(event) => setDraft({ ...draft, partOfSpeech: event.target.value })}
                      className="border-white/10 bg-[#0c0c0c] text-white"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-white/45">
                    Transcription
                    <Input
                      value={draft.transcription}
                      onChange={(event) => setDraft({ ...draft, transcription: event.target.value })}
                      className="border-white/10 bg-[#0c0c0c] text-white"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-white/45">
                    Irregular forms
                    <Input
                      value={draft.irregularForms}
                      onChange={(event) => setDraft({ ...draft, irregularForms: event.target.value })}
                      placeholder="go/went/gone"
                      className="border-white/10 bg-[#0c0c0c] text-white placeholder:text-white/30"
                    />
                  </label>
                </div>
                {draft.examples.map((example, exampleIndex) => (
                  <label key={exampleIndex} className="block space-y-1.5 text-xs text-white/45">
                    Example {exampleIndex + 1}
                    <Textarea
                      value={example}
                      rows={2}
                      onChange={(event) => {
                        const examples = [...draft.examples] as [string, string, string];
                        examples[exampleIndex] = event.target.value;
                        setDraft({ ...draft, examples });
                      }}
                      className="min-h-20 border-white/10 bg-[#0c0c0c] text-white"
                    />
                  </label>
                ))}
                <label className="block space-y-1.5 text-xs text-white/45">
                  Definition
                  <Textarea
                    value={draft.definition}
                    rows={2}
                    onChange={(event) => setDraft({ ...draft, definition: event.target.value })}
                    className="min-h-20 border-white/10 bg-[#0c0c0c] text-white"
                  />
                </label>
                {error && editingCard?.id === card.id ? (
                  <p className="text-sm text-red-300">{error}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={pending}
                    onClick={onSave}
                    className="bg-[#3d8bff] text-white hover:bg-[#2f7af0]"
                  >
                    {pending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={cancelEdit}
                    className="border-white/15 bg-transparent text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
