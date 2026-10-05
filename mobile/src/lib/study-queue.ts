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
