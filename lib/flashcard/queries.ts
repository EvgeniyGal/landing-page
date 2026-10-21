import { and, asc, count, eq, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { decks, flashcards } from "@/lib/db/schema";
import { getUserSrsConfig, ratingPreview } from "@/lib/srs/review";

export const DECK_CARD_PAGE_SIZES = [20, 50, 100] as const;
export type DeckCardPageSize = (typeof DECK_CARD_PAGE_SIZES)[number];
export const DEFAULT_DECK_CARD_PAGE_SIZE: DeckCardPageSize = 20;

export type DeckCardListOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type DeckCardListResult = {
  cards: Awaited<ReturnType<typeof fetchDeckCards>>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  search: string;
};

function escapeIlike(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function cardSearchCondition(search: string): SQL | undefined {
  const trimmed = search.trim();
  if (!trimmed) {
    return undefined;
  }
  const pattern = `%${escapeIlike(trimmed)}%`;
  return or(
    ilike(flashcards.word, pattern),
    ilike(flashcards.inputText, pattern),
    ilike(flashcards.irregularForms, pattern),
    ilike(flashcards.definition, pattern),
    ilike(flashcards.outputText, pattern),
  );
}

function deckCardsWhere(deckId: string, search: string) {
  const searchCondition = cardSearchCondition(search);
  return searchCondition
    ? and(eq(flashcards.deckId, deckId), searchCondition)
    : eq(flashcards.deckId, deckId);
}

function normalizePageSize(pageSize: number | undefined): number | null {
  if (pageSize == null || !Number.isFinite(pageSize)) {
    return null;
  }
  const allowed = DECK_CARD_PAGE_SIZES as readonly number[];
  if (allowed.includes(pageSize)) {
    return pageSize;
  }
  return DEFAULT_DECK_CARD_PAGE_SIZE;
}

async function fetchDeckCards(deckId: string, search: string, limit?: number, offset?: number) {
  const db = getDb();
  return db.query.flashcards.findMany({
    where: deckCardsWhere(deckId, search),
    orderBy: [asc(flashcards.createdAt)],
    with: { audio: true },
    ...(limit != null ? { limit, offset: offset ?? 0 } : {}),
  });
}

export async function listDecksForUser(userId: string) {
  const db = getDb();
  const now = new Date();
  const rows = await db
    .select({
      id: decks.id,
      name: decks.name,
      isDefault: decks.isDefault,
      createdAt: decks.createdAt,
      cardsDueToday: sql<number>`coalesce(count(*) filter (where ${flashcards.id} is not null and ${flashcards.dueAt} <= ${now.toISOString()}::timestamptz), 0)`.mapWith(Number),
      cardCount: sql<number>`count(${flashcards.id})`.mapWith(Number),
    })
    .from(decks)
    .leftJoin(flashcards, eq(flashcards.deckId, decks.id))
    .where(eq(decks.userId, userId))
    .groupBy(decks.id)
    .orderBy(asc(decks.createdAt));

  return rows;
}

async function getDeckCounts(deckId: string) {
  const db = getDb();
  const now = new Date();
  const [row] = await db
    .select({
      new: sql<number>`count(*) filter (where ${flashcards.state} = 'new')`.mapWith(Number),
      learning: sql<number>`count(*) filter (where ${flashcards.state} in ('learning', 'relearning'))`.mapWith(
        Number,
      ),
      review: sql<number>`count(*) filter (where ${flashcards.state} = 'review')`.mapWith(Number),
      due: sql<number>`count(*) filter (where ${flashcards.dueAt} <= ${now.toISOString()}::timestamptz)`.mapWith(
        Number,
      ),
    })
    .from(flashcards)
    .where(eq(flashcards.deckId, deckId));

  return {
    new: row?.new ?? 0,
    learning: row?.learning ?? 0,
    review: row?.review ?? 0,
    due: row?.due ?? 0,
  };
}

export async function listDeckCards(
  userId: string,
  deckId: string,
  options: DeckCardListOptions = {},
): Promise<DeckCardListResult | null> {
  const db = getDb();
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
    columns: { id: true },
  });
  if (!deck) {
    return null;
  }

  const search = options.search?.trim() ?? "";
  const where = deckCardsWhere(deckId, search);
  const [{ total }] = await db.select({ total: count() }).from(flashcards).where(where);
  const normalizedPageSize = normalizePageSize(options.pageSize);

  if (normalizedPageSize == null) {
    const cards = await fetchDeckCards(deckId, search);
    return {
      cards,
      total,
      page: 1,
      pageSize: total || DEFAULT_DECK_CARD_PAGE_SIZE,
      totalPages: 1,
      search,
    };
  }

  const totalPages = Math.max(1, Math.ceil(total / normalizedPageSize) || 1);
  const page = Math.min(Math.max(1, Math.floor(options.page ?? 1) || 1), totalPages);
  const cards = await fetchDeckCards(deckId, search, normalizedPageSize, (page - 1) * normalizedPageSize);

  return {
    cards,
    total,
    page,
    pageSize: normalizedPageSize,
    totalPages,
    search,
  };
}

export async function getDeckDetail(
  userId: string,
  deckId: string,
  options: DeckCardListOptions = {},
) {
  const db = getDb();
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
  });
  if (!deck) {
    return null;
  }

  const [counts, list] = await Promise.all([
    getDeckCounts(deckId),
    listDeckCards(userId, deckId, options),
  ]);

  if (!list) {
    return null;
  }

  return { deck, counts, ...list };
}

export async function getDueCards(userId: string, deckId: string) {
  const db = getDb();
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
  });
  if (!deck) {
    return null;
  }

  const now = new Date();
  const [cards, srsConfig] = await Promise.all([
    db.query.flashcards.findMany({
      where: and(eq(flashcards.deckId, deckId), lte(flashcards.dueAt, now)),
      orderBy: [asc(flashcards.dueAt), asc(flashcards.createdAt)],
      with: { audio: true },
    }),
    getUserSrsConfig(userId),
  ]);

  return {
    deck,
    cards: cards.map((card) => ({
      ...card,
      intervals: ratingPreview(card, srsConfig),
    })),
  };
}
