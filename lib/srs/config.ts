export type SrsConfig = {
  intervalModifier: number;
  startingEase: number;
  easyBonus: number;
  hardInterval: number;
  easeFloor: number;
  graduatingIntervalDays: number;
  easyIntervalDays: number;
  lapseNewInterval: number;
};

export const DEFAULT_SRS_CONFIG: SrsConfig = {
  intervalModifier: 1,
  startingEase: 2.5,
  easyBonus: 1.3,
  hardInterval: 0.8,
  easeFloor: 1.3,
  graduatingIntervalDays: 1,
  easyIntervalDays: 4,
  lapseNewInterval: 0,
};

export const SRS_FIELD_META = {
  intervalModifier: {
    label: "Interval modifier",
    help: "Scales Hard, Good, and Easy review intervals. Lower than 1 brings cards back sooner; higher than 1 spaces them out.",
    min: 0.5,
    max: 2,
    step: 0.05,
    example: (v: number) =>
      `Example: a 10-day Good at ease 2.5 becomes ~${formatDays(10 * 2.5 * v)} with modifier ${v}.`,
  },
  startingEase: {
    label: "Starting ease",
    help: "Ease assigned to new cards. On Good in review, the next interval is roughly previous × ease.",
    min: 1.3,
    max: 3,
    step: 0.05,
    example: (v: number) =>
      `Example: after a 4-day interval, Good schedules ~${formatDays(4 * v)} at ease ${v}.`,
  },
  easyBonus: {
    label: "Easy bonus",
    help: "Extra multiplier applied only when you rate Easy in review (on top of ease).",
    min: 1,
    max: 2,
    step: 0.05,
    example: (v: number) =>
      `Example: a 10-day Easy at ease 2.5 becomes ~${formatDays(10 * 2.5 * v)}.`,
  },
  hardInterval: {
    label: "Hard interval",
    help: "Multiplier for Hard in review. Values below 1 shorten the current interval (unlike Anki’s 1.2). 1 keeps the same length.",
    min: 0.5,
    max: 1,
    step: 0.05,
    example: (v: number) =>
      `Example: a 10-day Hard becomes ~${formatDays(Math.max(1, 10 * v))} with factor ${v}.`,
  },
} as const;

export type SrsTunableKey = keyof typeof SRS_FIELD_META;

function formatDays(days: number) {
  const rounded = Math.round(days * 10) / 10;
  return `${rounded}d`;
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

export function normalizeSrsConfig(partial?: Partial<SrsConfig> | null): SrsConfig {
  const base = { ...DEFAULT_SRS_CONFIG, ...partial };
  return {
    intervalModifier: clamp(base.intervalModifier, 0.5, 2),
    startingEase: clamp(base.startingEase, 1.3, 3),
    easyBonus: clamp(base.easyBonus, 1, 2),
    hardInterval: clamp(base.hardInterval, 0.5, 1),
    easeFloor: clamp(base.easeFloor, 1.3, 3),
    graduatingIntervalDays: Math.max(1, base.graduatingIntervalDays || 1),
    easyIntervalDays: Math.max(1, base.easyIntervalDays || 4),
    lapseNewInterval: clamp(base.lapseNewInterval, 0, 1),
  };
}

export function serializeSrsPreferences(prefs: {
  srsIntervalModifier?: number | null;
  srsStartingEase?: number | null;
  srsEasyBonus?: number | null;
  srsHardInterval?: number | null;
}) {
  const config = normalizeSrsConfig({
    intervalModifier: prefs.srsIntervalModifier ?? DEFAULT_SRS_CONFIG.intervalModifier,
    startingEase: prefs.srsStartingEase ?? DEFAULT_SRS_CONFIG.startingEase,
    easyBonus: prefs.srsEasyBonus ?? DEFAULT_SRS_CONFIG.easyBonus,
    hardInterval: prefs.srsHardInterval ?? DEFAULT_SRS_CONFIG.hardInterval,
  });
  return {
    srsIntervalModifier: config.intervalModifier,
    srsStartingEase: config.startingEase,
    srsEasyBonus: config.easyBonus,
    srsHardInterval: config.hardInterval,
  };
}

export function srsConfigFromPreferences(prefs: {
  srsIntervalModifier?: number | null;
  srsStartingEase?: number | null;
  srsEasyBonus?: number | null;
  srsHardInterval?: number | null;
}): SrsConfig {
  return normalizeSrsConfig({
    intervalModifier: prefs.srsIntervalModifier ?? undefined,
    startingEase: prefs.srsStartingEase ?? undefined,
    easyBonus: prefs.srsEasyBonus ?? undefined,
    hardInterval: prefs.srsHardInterval ?? undefined,
  });
}
