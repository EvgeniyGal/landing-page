import { DEFAULT_SRS_CONFIG, type SrsConfig } from "@/lib/srs/config";

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
export const GRADUATING_INTERVAL_DAYS = DEFAULT_SRS_CONFIG.graduatingIntervalDays;
export const EASY_INTERVAL_DAYS = DEFAULT_SRS_CONFIG.easyIntervalDays;
export const STARTING_EASE = DEFAULT_SRS_CONFIG.startingEase;
export const EASY_BONUS = DEFAULT_SRS_CONFIG.easyBonus;
/** Product default: Hard shortens the current interval (unlike Anki’s 1.2). */
export const HARD_INTERVAL = DEFAULT_SRS_CONFIG.hardInterval;
export const EASE_FLOOR = DEFAULT_SRS_CONFIG.easeFloor;
export const INTERVAL_MODIFIER = DEFAULT_SRS_CONFIG.intervalModifier;

const DAY_MS = 86_400_000;

function resolveConfig(config?: Partial<SrsConfig> | null): SrsConfig {
  return { ...DEFAULT_SRS_CONFIG, ...config };
}

export function newCardSchedule(now = new Date(), config?: Partial<SrsConfig> | null): Sm2Card {
  const cfg = resolveConfig(config);
  return {
    state: "new",
    stepIndex: 0,
    ease: cfg.startingEase,
    intervalDays: 0,
    dueAt: now,
    lapses: 0,
    reps: 0,
  };
}

function clampEase(ease: number, floor: number) {
  return Math.max(floor, Number(ease.toFixed(3)));
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

function applyLearning(card: Sm2Card, rating: Rating, now: Date, cfg: SrsConfig): Sm2Card {
  if (rating === "easy") {
    return {
      ...card,
      state: "review",
      stepIndex: 0,
      intervalDays: cfg.easyIntervalDays,
      dueAt: addDays(now, cfg.easyIntervalDays),
      ease: clampEase(card.ease + 0.15, cfg.easeFloor),
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
    // Again/Good are both the first step (1m), so Hard (avg of those) is also 1m.
    return {
      ...card,
      state: "learning",
      stepIndex: 0,
      dueAt: addMs(now, LEARNING_STEPS_MS[0]),
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
        ? Math.max(cfg.graduatingIntervalDays, card.intervalDays || cfg.graduatingIntervalDays)
        : cfg.graduatingIntervalDays;
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

function computeReviewIntervals(card: Sm2Card, cfg: SrsConfig) {
  const current = Math.max(card.intervalDays || cfg.graduatingIntervalDays, cfg.graduatingIntervalDays);
  let hard = Math.max(1, current * cfg.hardInterval * cfg.intervalModifier);
  let good = Math.max(
    cfg.graduatingIntervalDays,
    current * card.ease * cfg.intervalModifier,
  );
  let easy = Math.max(
    1,
    current * card.ease * cfg.easyBonus * cfg.intervalModifier,
  );

  // Enforce Hard < Good < Easy (day intervals).
  if (hard >= good) {
    hard = Math.max(1, good - 0.1);
  }
  if (easy <= good) {
    easy = good + 0.1;
  }

  return { hard, good, easy };
}

function applyReview(card: Sm2Card, rating: Rating, now: Date, cfg: SrsConfig): Sm2Card {
  if (rating === "again") {
    return {
      ...card,
      state: "relearning",
      stepIndex: 0,
      ease: clampEase(card.ease - 0.2, cfg.easeFloor),
      intervalDays: card.intervalDays * cfg.lapseNewInterval,
      dueAt: addMs(now, LEARNING_STEPS_MS[0]),
      lapses: card.lapses + 1,
      reps: card.reps + 1,
    };
  }

  const intervals = computeReviewIntervals(card, cfg);

  if (rating === "hard") {
    return {
      ...card,
      ease: clampEase(card.ease - 0.15, cfg.easeFloor),
      intervalDays: intervals.hard,
      dueAt: addDays(now, intervals.hard),
      reps: card.reps + 1,
    };
  }

  if (rating === "easy") {
    return {
      ...card,
      ease: clampEase(card.ease + 0.15, cfg.easeFloor),
      intervalDays: intervals.easy,
      dueAt: addDays(now, intervals.easy),
      reps: card.reps + 1,
    };
  }

  return {
    ...card,
    intervalDays: intervals.good,
    dueAt: addDays(now, intervals.good),
    reps: card.reps + 1,
  };
}

export function scheduleReview(
  card: Sm2Card,
  rating: Rating,
  now = new Date(),
  config?: Partial<SrsConfig> | null,
): Sm2Card {
  const cfg = resolveConfig(config);
  if (card.state === "new" || card.state === "learning" || card.state === "relearning") {
    return applyLearning(card, rating, now, cfg);
  }
  return applyReview(card, rating, now, cfg);
}

export function previewIntervals(
  card: Sm2Card,
  now = new Date(),
  config?: Partial<SrsConfig> | null,
): Record<Rating, string> {
  const ratings: Rating[] = ["again", "hard", "good", "easy"];
  return Object.fromEntries(
    ratings.map((rating) => {
      const next = scheduleReview(card, rating, now, config);
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
