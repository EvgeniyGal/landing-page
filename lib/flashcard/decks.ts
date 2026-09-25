import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { decks, type Deck } from "@/lib/db/schema";

const DEFAULT_DECK_NAME = "English";

export async function getOrCreateDefaultDeck(userId: string): Promise<Deck> {
  const db = getDb();
  const existing = await db.query.decks.findFirst({
    where: and(eq(decks.userId, userId), eq(decks.isDefault, true)),
  });
  if (existing) {
    return existing;
  }

  const anyDeck = await db.query.decks.findFirst({
    where: eq(decks.userId, userId),
  });
  if (anyDeck) {
    return anyDeck;
  }

  const [created] = await db
    .insert(decks)
    .values({
      userId,
      name: DEFAULT_DECK_NAME,
      isDefault: true,
    })
    .returning();

  return created;
}

export async function getDeckForUser(userId: string, deckId: string) {
  const db = getDb();
  return db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
  });
}

export async function createDeckForUser(input: {
  userId: string;
  name: string;
}): Promise<{ ok: true; deck: Deck } | { ok: false; reason: "invalid_name" }> {
  const name = input.name.trim();
  if (!name || name.length > 255) {
    return { ok: false as const, reason: "invalid_name" as const };
  }

  const db = getDb();
  const existingCount = await db.query.decks.findMany({
    where: eq(decks.userId, input.userId),
    columns: { id: true },
  });
  const [created] = await db
    .insert(decks)
    .values({
      userId: input.userId,
      name,
      isDefault: existingCount.length === 0,
    })
    .returning();

  return { ok: true as const, deck: created };
}

export async function deleteDeckForUser(input: {
  userId: string;
  deckId: string;
}): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
  const db = getDb();
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, input.deckId), eq(decks.userId, input.userId)),
  });
  if (!deck) {
    return { ok: false as const, reason: "not_found" as const };
  }

  const wasDefault = deck.isDefault;
  await db.delete(decks).where(and(eq(decks.id, input.deckId), eq(decks.userId, input.userId)));

  if (wasDefault) {
    const nextDefault = await db.query.decks.findFirst({
      where: eq(decks.userId, input.userId),
      orderBy: [asc(decks.createdAt)],
    });
    if (nextDefault) {
      await db.update(decks).set({ isDefault: true }).where(eq(decks.id, nextDefault.id));
    }
  }

  return { ok: true as const };
}
