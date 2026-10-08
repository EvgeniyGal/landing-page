export type SrsPrefs = {
  srsIntervalModifier: number;
  srsStartingEase: number;
  srsEasyBonus: number;
  srsHardInterval: number;
};

export const DEFAULT_SRS_PREFS: SrsPrefs = {
  srsIntervalModifier: 1,
  srsStartingEase: 2.5,
  srsEasyBonus: 1.3,
  srsHardInterval: 0.8,
};

export type SrsFieldKey = keyof SrsPrefs;

export const SRS_FIELDS: {
  key: SrsFieldKey;
  label: string;
  help: string;
  min: number;
  max: number;
  step: number;
  example: (value: number) => string;
}[] = [
  {
    key: "srsIntervalModifier",
    label: "Interval modifier",
    help: "Scales Hard, Good, and Easy review intervals. Lower than 1 brings cards back sooner; higher than 1 spaces them out.",
    min: 0.5,
    max: 2,
    step: 0.05,
    example: (v) => `Example: a 10-day Good at ease 2.5 becomes ~${(10 * 2.5 * v).toFixed(1)}d with modifier ${v}.`,
  },
  {
    key: "srsStartingEase",
    label: "Starting ease",
    help: "Ease assigned to new cards. On Good in review, the next interval is roughly previous × ease.",
    min: 1.3,
    max: 3,
    step: 0.05,
    example: (v) => `Example: after a 4-day interval, Good schedules ~${(4 * v).toFixed(1)}d at ease ${v}.`,
  },
  {
    key: "srsEasyBonus",
    label: "Easy bonus",
    help: "Extra multiplier applied only when you rate Easy in review (on top of ease).",
    min: 1,
    max: 2,
    step: 0.05,
    example: (v) => `Example: a 10-day Easy at ease 2.5 becomes ~${(10 * 2.5 * v).toFixed(1)}d.`,
  },
  {
    key: "srsHardInterval",
    label: "Hard interval",
    help: "Multiplier for Hard in review. Values below 1 shorten the current interval (unlike Anki’s 1.2). 1 keeps the same length.",
    min: 0.5,
    max: 1,
    step: 0.05,
    example: (v) => `Example: a 10-day Hard becomes ~${Math.max(1, 10 * v).toFixed(1)}d with factor ${v}.`,
  },
];

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

export function normalizeSrsPrefs(prefs: Partial<SrsPrefs>): SrsPrefs {
  return {
    srsIntervalModifier: clamp(prefs.srsIntervalModifier ?? DEFAULT_SRS_PREFS.srsIntervalModifier, 0.5, 2),
    srsStartingEase: clamp(prefs.srsStartingEase ?? DEFAULT_SRS_PREFS.srsStartingEase, 1.3, 3),
    srsEasyBonus: clamp(prefs.srsEasyBonus ?? DEFAULT_SRS_PREFS.srsEasyBonus, 1, 2),
    srsHardInterval: clamp(prefs.srsHardInterval ?? DEFAULT_SRS_PREFS.srsHardInterval, 0.5, 1),
  };
}
