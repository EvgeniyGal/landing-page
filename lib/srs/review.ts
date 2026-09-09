import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { flashcards, reviewLogs, type ReviewRating } from "@/lib/db/schema";
import { previewIntervals, scheduleReview, toSm2Card } from "@/lib/srs/sm2";

export async function reviewCard(input: {
  userId: string;
  flashcardId: string;
  rating: ReviewRating;
}) {
  const db = getDb();
  const card = await db.query.flashcards.findFirst({
    where: and(eq(flashcards.id, input.flashcardId), eq(flashcards.userId, input.userId)),
  });
  if (!card) {
    return { ok: false as const, reason: "not_found" as const };
  }

  const previous = toSm2Card(card);
  const next = scheduleReview(previous, input.rating);

  await db
    .update(flashcards)
    .set({
      state: next.state,
      stepIndex: next.stepIndex,
      ease: next.ease,
      intervalDays: next.intervalDays,
      dueAt: next.dueAt,
      lapses: next.lapses,
      reps: next.reps,
    })
    .where(eq(flashcards.id, card.id));

  await db.insert(reviewLogs).values({
    flashcardId: card.id,
    userId: input.userId,
    rating: input.rating,
    previousIntervalDays: previous.intervalDays,
    nextIntervalDays: next.intervalDays,
  });

  return { ok: true as const, card: { ...card, ...next } };
}

export function ratingPreview(card: Parameters<typeof toSm2Card>[0]) {
  return previewIntervals(toSm2Card(card));
}
