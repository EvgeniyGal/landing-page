"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteCardAction } from "@/app/app/actions";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { SpeakerButton } from "@/components/app/speaker-button";
import { Button } from "@/components/ui/button";

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

export function DeckCardList({ deckId, cards }: { deckId: string; cards: DeckCardItem[] }) {
  const [items, setItems] = useState(cards);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeckCardItem | null>(null);
  const [pending, startTransition] = useTransition();

  function onConfirmDelete() {
    if (!pendingDelete) {
      return;
    }
    const target = pendingDelete;
    startTransition(async () => {
      const result = await deleteCardAction({ flashcardId: target.id, deckId });
      if (!result.ok) {
        setError(result.error);
        setPendingDelete(null);
        return;
      }
      setItems((current) => current.filter((item) => item.id !== target.id));
      setPendingDelete(null);
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
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <ul className="overflow-hidden rounded-2xl bg-[#1a1a1a]">
        {items.map((card, index) => (
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
                  asChild
                  className="size-8 text-white/55 hover:bg-white/10 hover:text-white"
                >
                  <Link href={`/app/decks/${deckId}/cards/${card.id}/edit`} aria-label={`Edit ${card.word}`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={pending}
                  aria-label={`Delete ${card.word}`}
                  onClick={() => {
                    setError(null);
                    setPendingDelete(card);
                  }}
                  className="size-8 text-white/55 hover:bg-red-500/15 hover:text-red-200"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete card?"
        description={
          pendingDelete
            ? `Delete “${pendingDelete.irregularForms || pendingDelete.word}”? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete card"
        pending={pending}
        onCancel={() => {
          if (!pending) {
            setPendingDelete(null);
          }
        }}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
