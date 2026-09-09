import { and, asc, eq, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { decks, flashcards } from "@/lib/db/schema";
import { ratingPreview } from "@/lib/srs/review";

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

export async function getDeckDetail(userId: string, deckId: string) {
  const db = getDb();
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
  });
  if (!deck) {
    return null;
  }

  const now = new Date();
  const cards = await db.query.flashcards.findMany({
    where: eq(flashcards.deckId, deckId),
    orderBy: [asc(flashcards.createdAt)],
    with: { audio: true },
  });

  const counts = {
    new: cards.filter((card) => card.state === "new").length,
    learning: cards.filter((card) => card.state === "learning" || card.state === "relearning").length,
    review: cards.filter((card) => card.state === "review").length,
    due: cards.filter((card) => card.dueAt <= now).length,
  };

  return { deck, cards, counts };
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
  const cards = await db.query.flashcards.findMany({
    where: and(eq(flashcards.deckId, deckId), lte(flashcards.dueAt, now)),
    orderBy: [asc(flashcards.dueAt), asc(flashcards.createdAt)],
    with: { audio: true },
  });

  return {
    deck,
    cards: cards.map((card) => ({
      ...card,
      intervals: ratingPreview(card),
    })),
  };
}
