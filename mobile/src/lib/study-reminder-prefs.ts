import * as SecureStore from "expo-secure-store";

export const STUDY_REMINDER_PREFS_KEY = "study.reminder";

export type StudyReminderPrefs = {
  enabled: boolean;
  /** Local hour 0–23 */
  hour: number;
  /** Local minute 0–59 */
  minute: number;
  /** YYYY-MM-DD of last presented reminder (local) */
  lastNotifiedDay: string | null;
};

export const DEFAULT_STUDY_REMINDER_PREFS: StudyReminderPrefs = {
  enabled: false,
  hour: 9,
  minute: 0,
  lastNotifiedDay: null,
};

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function parseStudyReminderPrefs(raw: unknown): StudyReminderPrefs {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_STUDY_REMINDER_PREFS };
  }
  const data = raw as Record<string, unknown>;
  return {
    enabled: Boolean(data.enabled),
    hour: clampInt(data.hour, 0, 23, DEFAULT_STUDY_REMINDER_PREFS.hour),
    minute: clampInt(data.minute, 0, 59, DEFAULT_STUDY_REMINDER_PREFS.minute),
    lastNotifiedDay:
      typeof data.lastNotifiedDay === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.lastNotifiedDay)
        ? data.lastNotifiedDay
        : null,
  };
}

export async function readStudyReminderPrefs(): Promise<StudyReminderPrefs> {
  try {
    const raw = await SecureStore.getItemAsync(STUDY_REMINDER_PREFS_KEY);
    if (!raw) {
      return { ...DEFAULT_STUDY_REMINDER_PREFS };
    }
    return parseStudyReminderPrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_STUDY_REMINDER_PREFS };
  }
}

export async function writeStudyReminderPrefs(prefs: StudyReminderPrefs): Promise<void> {
  try {
    await SecureStore.setItemAsync(STUDY_REMINDER_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // SecureStore can fail on some web/dev targets.
  }
}

export function formatReminderTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function localDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateAtLocalTime(base: Date, hour: number, minute: number) {
  const next = new Date(base);
  next.setHours(hour, minute, 0, 0);
  return next;
}
