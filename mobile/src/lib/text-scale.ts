export const TEXT_SCALE_STEPS = [0.75, 1, 1.25, 1.5] as const;

export type TextScaleStep = (typeof TEXT_SCALE_STEPS)[number];

export const TEXT_SCALE_LABELS: Record<TextScaleStep, string> = {
  0.75: "Small",
  1: "Default",
  1.25: "Large",
  1.5: "XL",
};

export const DEFAULT_TEXT_SCALE: TextScaleStep = 1;

export type StudyTextScales = {
  wordTextScale: TextScaleStep;
  exampleTextScale: TextScaleStep;
  explanationTextScale: TextScaleStep;
};

export type StudyMode = "regular" | "lazyEye";

export type DeviceTextScalePrefs = Record<StudyMode, StudyTextScales>;

export const DEFAULT_STUDY_TEXT_SCALES: StudyTextScales = {
  wordTextScale: DEFAULT_TEXT_SCALE,
  exampleTextScale: DEFAULT_TEXT_SCALE,
  explanationTextScale: DEFAULT_TEXT_SCALE,
};

export const DEFAULT_DEVICE_TEXT_SCALE_PREFS: DeviceTextScalePrefs = {
  regular: { ...DEFAULT_STUDY_TEXT_SCALES },
  lazyEye: { ...DEFAULT_STUDY_TEXT_SCALES },
};

export function isTextScaleStep(value: unknown): value is TextScaleStep {
  return typeof value === "number" && (TEXT_SCALE_STEPS as readonly number[]).includes(value);
}

export function normalizeTextScale(value: number | null | undefined): TextScaleStep {
  if (isTextScaleStep(value)) {
    return value;
  }
  return DEFAULT_TEXT_SCALE;
}

export function serializeStudyTextScales(prefs: {
  wordTextScale?: number;
  exampleTextScale?: number;
  explanationTextScale?: number;
}): StudyTextScales {
  return {
    wordTextScale: normalizeTextScale(prefs.wordTextScale),
    exampleTextScale: normalizeTextScale(prefs.exampleTextScale),
    explanationTextScale: normalizeTextScale(prefs.explanationTextScale),
  };
}

export function parseDeviceTextScalePrefs(raw: unknown): DeviceTextScalePrefs {
  if (!raw || typeof raw !== "object") {
    return {
      regular: { ...DEFAULT_STUDY_TEXT_SCALES },
      lazyEye: { ...DEFAULT_STUDY_TEXT_SCALES },
    };
  }
  const value = raw as Partial<Record<StudyMode, Partial<StudyTextScales>>>;
  return {
    regular: serializeStudyTextScales(value.regular ?? {}),
    lazyEye: serializeStudyTextScales(value.lazyEye ?? {}),
  };
}

export function modeFromLazyEye(lazyEyeEnabled: boolean): StudyMode {
  return lazyEyeEnabled ? "lazyEye" : "regular";
}
