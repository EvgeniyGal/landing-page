export type Rating = "again" | "hard" | "good" | "easy";
export type CardState = "new" | "learning" | "review" | "relearning";

export type Sm2Card = {
  state: CardState;
  stepIndex: number;
  ease: number;
  intervalDays: number;
  dueAt: Date;
  lapses: number;
  reps: number;
};

export const LEARNING_STEPS_MS = [60_000, 10 * 60_000] as const;
export const GRADUATING_INTERVAL_DAYS = 1;
export const EASY_INTERVAL_DAYS = 4;
export const STARTING_EASE = 2.5;
export const EASY_BONUS = 1.3;
export const HARD_INTERVAL = 1.2;
export const EASE_FLOOR = 1.3;
export const INTERVAL_MODIFIER = 1;

const DAY_MS = 86_400_000;

export function newCardSchedule(now = new Date()): Sm2Card {
  return {
    state: "new",
    stepIndex: 0,
    ease: STARTING_EASE,
    intervalDays: 0,
    dueAt: now,
    lapses: 0,
    reps: 0,
  };
}

function clampEase(ease: number) {
  return Math.max(EASE_FLOOR, Number(ease.toFixed(3)));
}

function addDays(from: Date, days: number) {
  return new Date(from.getTime() + days * DAY_MS);
}

function addMs(from: Date, ms: number) {
  return new Date(from.getTime() + ms);
}

function formatDuration(ms: number): string {
  if (ms < 60_000) {
    return "<1m";
  }
  if (ms < DAY_MS) {
    const minutes = Math.round(ms / 60_000);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
  }
  const days = ms / DAY_MS;
  if (days < 10) {
    return `${Number(days.toFixed(1))}d`;
  }
  return `${Math.round(days)}d`;
}

function applyLearning(card: Sm2Card, rating: Rating, now: Date): Sm2Card {
  if (rating === "easy") {
    return {
      ...card,
      state: "review",
      stepIndex: 0,
      intervalDays: EASY_INTERVAL_DAYS,
      dueAt: addDays(now, EASY_INTERVAL_DAYS),
      ease: clampEase(card.ease + 0.15),
      reps: card.reps + 1,
    };
  }

  if (rating === "again") {
    return {
      ...card,
      state: card.state === "relearning" ? "relearning" : "learning",
      stepIndex: 0,
      dueAt: addMs(now, LEARNING_STEPS_MS[0]),
      reps: card.reps + 1,
    };
  }

  if (card.state === "new") {
    const delay =
      rating === "hard"
        ? (LEARNING_STEPS_MS[0] + LEARNING_STEPS_MS[1]) / 2
        : LEARNING_STEPS_MS[0];
    return {
      ...card,
      state: "learning",
      stepIndex: 0,
      dueAt: addMs(now, delay),
      reps: card.reps + 1,
    };
  }

  if (rating === "hard") {
    return {
      ...card,
      dueAt: addMs(now, LEARNING_STEPS_MS[card.stepIndex] ?? LEARNING_STEPS_MS[0]),
      reps: card.reps + 1,
    };
  }

  const nextStep = card.stepIndex + 1;
  if (nextStep >= LEARNING_STEPS_MS.length) {
    const intervalDays =
      card.state === "relearning"
        ? Math.max(1, card.intervalDays || GRADUATING_INTERVAL_DAYS)
        : GRADUATING_INTERVAL_DAYS;
    return {
      ...card,
      state: "review",
      stepIndex: 0,
      intervalDays,
      dueAt: addDays(now, intervalDays),
      reps: card.reps + 1,
    };
  }

  return {
    ...card,
    stepIndex: nextStep,
    dueAt: addMs(now, LEARNING_STEPS_MS[nextStep]),
    reps: card.reps + 1,
  };
}

function applyReview(card: Sm2Card, rating: Rating, now: Date): Sm2Card {
  if (rating === "again") {
    return {
      ...card,
      state: "relearning",
      stepIndex: 0,
      ease: clampEase(card.ease - 0.2),
      intervalDays: Math.max(1, card.intervalDays * 0),
      dueAt: addMs(now, LEARNING_STEPS_MS[0]),
      lapses: card.lapses + 1,
      reps: card.reps + 1,
    };
  }

  if (rating === "hard") {
    const intervalDays = Math.max(1, card.intervalDays * HARD_INTERVAL * INTERVAL_MODIFIER);
    return {
      ...card,
      ease: clampEase(card.ease - 0.15),
      intervalDays,
      dueAt: addDays(now, intervalDays),
      reps: card.reps + 1,
    };
  }

  if (rating === "easy") {
    const intervalDays = Math.max(
      1,
      (card.intervalDays || GRADUATING_INTERVAL_DAYS) * card.ease * EASY_BONUS * INTERVAL_MODIFIER,
    );
    return {
      ...card,
      ease: clampEase(card.ease + 0.15),
      intervalDays,
      dueAt: addDays(now, intervalDays),
      reps: card.reps + 1,
    };
  }

  const intervalDays = Math.max(
    GRADUATING_INTERVAL_DAYS,
    (card.intervalDays || GRADUATING_INTERVAL_DAYS) * card.ease * INTERVAL_MODIFIER,
  );
  return {
    ...card,
    intervalDays,
    dueAt: addDays(now, intervalDays),
    reps: card.reps + 1,
  };
}

export function scheduleReview(card: Sm2Card, rating: Rating, now = new Date()): Sm2Card {
  if (card.state === "new" || card.state === "learning" || card.state === "relearning") {
    return applyLearning(card, rating, now);
  }
  return applyReview(card, rating, now);
}

export function previewIntervals(card: Sm2Card, now = new Date()): Record<Rating, string> {
  const ratings: Rating[] = ["again", "hard", "good", "easy"];
  return Object.fromEntries(
    ratings.map((rating) => {
      const next = scheduleReview(card, rating, now);
      return [rating, formatDuration(next.dueAt.getTime() - now.getTime())];
    }),
  ) as Record<Rating, string>;
}

export function toSm2Card(row: {
  state: CardState;
  stepIndex: number;
  ease: number;
  intervalDays: number;
  dueAt: Date;
  lapses: number;
  reps: number;
}): Sm2Card {
  return {
    state: row.state,
    stepIndex: row.stepIndex,
    ease: row.ease,
    intervalDays: row.intervalDays,
    dueAt: row.dueAt,
    lapses: row.lapses,
    reps: row.reps,
  };
}
