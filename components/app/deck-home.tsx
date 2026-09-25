"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { createDeckAction, deleteDeckAction } from "@/app/app/actions";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type HomeDeckItem = {
  id: string;
  name: string;
  cardsDueToday: number;
  cardCount: number;
};

export function DeckHome({
  defaultDeckId,
  decks: initialDecks,
}: {
  defaultDeckId: string;
  decks: HomeDeckItem[];
}) {
  const router = useRouter();
  const [decks, setDecks] = useState(initialDecks);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HomeDeckItem | null>(null);
  const [pending, startTransition] = useTransition();

  function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createDeckAction({ name });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDecks((current) => [
        ...current,
        {
          id: result.deck.id,
          name: result.deck.name,
          cardsDueToday: 0,
          cardCount: 0,
        },
      ]);
      setName("");
      setAdding(false);
      router.refresh();
    });
  }

  function onConfirmDelete() {
    if (!pendingDelete) {
      return;
    }
    const target = pendingDelete;
    startTransition(async () => {
      const result = await deleteDeckAction({ deckId: target.id });
      if (!result.ok) {
        setError(result.error);
        setPendingDelete(null);
        return;
      }
      setDecks((current) => current.filter((deck) => deck.id !== target.id));
      setPendingDelete(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">Home</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAdding(true);
              setError(null);
            }}
            className="border-white/15 bg-transparent text-white hover:bg-white/5"
          >
            <Plus className="size-4" />
            Add dictionary
          </Button>
          <Link
            href={`/app/decks/${defaultDeckId}/add`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3d8bff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f7af0]"
          >
            <Plus className="size-4" />
            Add manually
          </Link>
        </div>
      </div>

      {adding ? (
        <form
          onSubmit={(event) => void onCreate(event)}
          className="flex flex-col gap-3 rounded-2xl bg-[#1a1a1a] p-4 sm:flex-row sm:items-center"
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Dictionary name"
            autoFocus
            maxLength={255}
            className="h-11 border-white/10 bg-[#141414] text-white placeholder:text-white/35"
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={pending || !name.trim()}
              className="h-11 bg-[#3d8bff] px-5 text-white hover:bg-[#2f7af0]"
            >
              {pending ? "Creating…" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setAdding(false);
                setName("");
                setError(null);
              }}
              className="h-11 border-white/15 bg-transparent text-white hover:bg-white/5"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl bg-[#1a1a1a]">
        {decks.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/50">
            No dictionaries yet. Create one to start adding cards.
          </p>
        ) : (
          <ul>
            {decks.map((deck, index) => (
              <li key={deck.id} className={index > 0 ? "border-t border-white/8" : undefined}>
                <div className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3">
                  <Link
                    href={`/app/decks/${deck.id}`}
                    className="flex min-w-0 flex-1 items-center justify-between rounded-xl px-2 py-3 hover:bg-white/4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-lg font-medium">{deck.name}</p>
                      <p className="mt-1 text-sm text-white/45">Cards for today: {deck.cardsDueToday}</p>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-white/35" />
                  </Link>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    aria-label={`Delete dictionary ${deck.name}`}
                    onClick={() => {
                      setError(null);
                      setPendingDelete(deck);
                    }}
                    className="size-9 shrink-0 text-white/45 hover:bg-red-500/15 hover:text-red-200"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete dictionary?"
        description={
          pendingDelete
            ? `Delete “${pendingDelete.name}”? ${
                pendingDelete.cardCount > 0
                  ? `This removes all ${pendingDelete.cardCount} card${pendingDelete.cardCount === 1 ? "" : "s"} in it.`
                  : "This dictionary has no cards."
              } This cannot be undone.`
            : ""
        }
        confirmLabel="Delete dictionary"
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
