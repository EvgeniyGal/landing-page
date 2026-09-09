import { and, eq } from "drizzle-orm";
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
