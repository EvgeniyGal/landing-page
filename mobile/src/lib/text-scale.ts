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
