"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
import { deleteCardAction } from "@/app/app/actions";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { SpeakerButton } from "@/components/app/speaker-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_DECK_CARD_PAGE_SIZE,
  DECK_CARD_PAGE_SIZES,
  type DeckCardPageSize,
} from "@/lib/flashcard/queries";
import { formatDueLabel } from "@/lib/srs/queue";

export type DeckCardItem = {
  id: string;
  word: string;
  partOfSpeech: string | null;
  transcription: string | null;
  irregularForms: string | null;
  examples: string[];
  definition: string;
  dueAt: string;
  stateLabel: string;
  stateClassName: string;
  audioWordUrl?: string;
};

export type DeckCardPagination = {
  page: number;
  pageSize: DeckCardPageSize;
  total: number;
  totalPages: number;
  search: string;
};

function buildDeckUrl(
  pathname: string,
  values: { q: string; page: number; pageSize: number },
) {
  const params = new URLSearchParams();
  if (values.q.trim()) {
    params.set("q", values.q.trim());
  }
  if (values.page > 1) {
    params.set("page", String(values.page));
  }
  if (values.pageSize !== DEFAULT_DECK_CARD_PAGE_SIZE) {
    params.set("pageSize", String(values.pageSize));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function DeckCardList({
  deckId,
  cards,
  pagination,
}: {
  deckId: string;
  cards: DeckCardItem[];
  pagination: DeckCardPagination;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState(cards);
  const [query, setQuery] = useState(pagination.search);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeckCardItem | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(cards);
  }, [cards]);

  useEffect(() => {
    setQuery(pagination.search);
  }, [pagination.search]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === pagination.search) {
      return;
    }
    const handle = window.setTimeout(() => {
      router.push(
        buildDeckUrl(pathname, {
          q: trimmed,
          page: 1,
          pageSize: pagination.pageSize,
        }),
      );
    }, 300);
    return () => window.clearTimeout(handle);
  }, [query, pagination.search, pagination.pageSize, pathname, router]);

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
      setPendingDelete(null);
      const remainingOnPage = items.length - 1;
      if (remainingOnPage <= 0 && pagination.page > 1) {
        router.push(
          buildDeckUrl(pathname, {
            q: pagination.search,
            page: pagination.page - 1,
            pageSize: pagination.pageSize,
          }),
        );
        return;
      }
      setItems((current) => current.filter((item) => item.id !== target.id));
      router.refresh();
    });
  }

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.page * pagination.pageSize, pagination.total);
  const emptyMessage = pagination.search
    ? `No cards match “${pagination.search}”.`
    : "No cards in this deck yet.";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search words…"
            aria-label="Search cards"
            className="h-11 border-white/10 bg-[#1a1a1a] pl-10 text-white placeholder:text-white/35"
          />
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-white/55">
          <span>Per page</span>
          <select
            value={pagination.pageSize}
            onChange={(event) => {
              const pageSize = Number(event.target.value) as DeckCardPageSize;
              router.push(
                buildDeckUrl(pathname, {
                  q: pagination.search,
                  page: 1,
                  pageSize,
                }),
              );
            }}
            className="h-11 rounded-md border border-white/10 bg-[#1a1a1a] px-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
          >
            {DECK_CARD_PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {items.length === 0 ? (
        <ul className="overflow-hidden rounded-2xl bg-[#1a1a1a]">
          <li className="px-5 py-10 text-sm text-white/45">{emptyMessage}</li>
        </ul>
      ) : (
        <ul className="overflow-hidden rounded-2xl bg-[#1a1a1a]">
          {items.map((card, index) => (
            <li key={card.id} className={index > 0 ? "border-t border-white/8" : undefined}>
              <div className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3">
                <Link
                  href={`/app/decks/${deckId}/cards/${card.id}/edit`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-3 hover:bg-white/4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{card.irregularForms || card.word}</p>
                    <p className="truncate text-sm text-white/45">{card.definition}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${card.stateClassName}`}>
                      {card.stateLabel}
                    </span>
                    <span className="text-[11px] text-white/40">{formatDueLabel(card.dueAt)}</span>
                  </div>
                </Link>
                {card.audioWordUrl ? (
                  <SpeakerButton
                    flashcardId={card.id}
                    kind="word"
                    url={card.audioWordUrl}
                    generateOnPlay={false}
                  />
                ) : null}
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
                  className="size-8 shrink-0 text-white/55 hover:bg-red-500/15 hover:text-red-200"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/45">
          {pagination.total === 0
            ? "0 cards"
            : `Showing ${from}–${to} of ${pagination.total}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() =>
              router.push(
                buildDeckUrl(pathname, {
                  q: pagination.search,
                  page: pagination.page - 1,
                  pageSize: pagination.pageSize,
                }),
              )
            }
            className="h-10 border-white/15 bg-transparent text-white hover:bg-white/5 disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <span className="min-w-20 text-center text-sm text-white/55">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              router.push(
                buildDeckUrl(pathname, {
                  q: pagination.search,
                  page: pagination.page + 1,
                  pageSize: pagination.pageSize,
                }),
              )
            }
            className="h-10 border-white/15 bg-transparent text-white hover:bg-white/5 disabled:opacity-40"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

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
