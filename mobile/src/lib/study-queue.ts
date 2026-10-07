import type { CardState } from "@/src/api/types";

export function dueTimestamp(dueAt: Date | string): number {
  return typeof dueAt === "string" ? new Date(dueAt).getTime() : dueAt.getTime();
}

export function shouldKeepInSession(state: CardState): boolean {
  return state === "learning" || state === "relearning";
}

export function insertByDueAt<T extends { dueAt: Date | string }>(queue: T[], card: T): T[] {
  const next = [...queue, card];
  next.sort((a, b) => dueTimestamp(a.dueAt) - dueTimestamp(b.dueAt));
  return next;
}

export function advanceStudyQueue<T extends { id: string; dueAt: Date | string; state: CardState }>(
  queue: T[],
  reviewed: T,
): T[] {
  const remaining = queue.filter((card) => card.id !== reviewed.id);
  if (!shouldKeepInSession(reviewed.state)) {
    return remaining;
  }
  return insertByDueAt(remaining, reviewed);
}

export function splitDueQueue<T extends { dueAt: Date | string }>(queue: T[], now = Date.now()) {
  const due: T[] = [];
  const waiting: T[] = [];
  for (const card of queue) {
    if (dueTimestamp(card.dueAt) <= now) {
      due.push(card);
    } else {
      waiting.push(card);
    }
  }
  return { due, waiting };
}

export function formatWaitLabel(ms: number): string {
  const seconds = Math.max(1, Math.ceil(ms / 1000));
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes}m`;
}

const DAY_MS = 86_400_000;

/** Relative next-appearance label for deck lists (learning minutes + review days). */
export function formatDueLabel(dueAt: Date | string, now = Date.now()): string {
  const ms = dueTimestamp(dueAt) - now;
  if (ms <= 0) {
    return "Due now";
  }
  if (ms < 60_000) {
    return "in <1m";
  }
  if (ms < DAY_MS) {
    const minutes = Math.round(ms / 60_000);
    if (minutes < 60) {
      return `in ${minutes}m`;
    }
    const hours = Math.round(minutes / 60);
    return `in ${hours}h`;
  }
  const days = ms / DAY_MS;
  if (days < 10) {
    const rounded = Number(days.toFixed(1));
    return `in ${rounded}d`;
  }
  return `in ${Math.round(days)}d`;
}
