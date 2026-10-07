"use client";

import { useLazyEye } from "@/components/app/lazy-eye-provider";
import {
  TEXT_SCALE_LABELS,
  TEXT_SCALE_STEPS,
  type StudyTextScales,
  type TextScaleStep,
} from "@/lib/study/text-scale";

const ROWS: { key: keyof StudyTextScales; label: string; preview: string; baseSize: number }[] = [
  { key: "wordTextScale", label: "Word", preview: "apple", baseSize: 30 },
  { key: "exampleTextScale", label: "Example", preview: "I ate an apple.", baseSize: 16 },
  {
    key: "explanationTextScale",
    label: "Explanation",
    preview: "A round fruit that grows on trees.",
    baseSize: 16,
  },
];

function ScaleChips({
  value,
  onChange,
  disabled,
}: {
  value: TextScaleStep;
  onChange: (step: TextScaleStep) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEXT_SCALE_STEPS.map((step) => {
        const active = value === step;
        return (
          <button
            key={step}
            type="button"
            disabled={disabled}
            onClick={() => onChange(step)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-white text-black"
                : "bg-white/10 text-white/75 hover:bg-white/15 hover:text-white"
            } disabled:opacity-50`}
          >
            {TEXT_SCALE_LABELS[step]}
          </button>
        );
      })}
    </div>
  );
}

export function StudyTextScaleSettings() {
  const {
    wordTextScale,
    exampleTextScale,
    explanationTextScale,
    setStudyTextScales,
    pending,
  } = useLazyEye();

  const scales: StudyTextScales = {
    wordTextScale,
    exampleTextScale,
    explanationTextScale,
  };

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1a1a1a] p-5">
      <div>
        <h2 className="text-xl font-semibold">Text size</h2>
        <p className="mt-1 text-sm text-white/50">
          Scale study card text. Useful for lazy-eye training and readability.
        </p>
      </div>

      {ROWS.map((row) => {
        const scale = scales[row.key];
        return (
          <div key={row.key} className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/45">
                {row.label}
              </span>
            </div>
            <ScaleChips
              value={scale}
              disabled={pending}
              onChange={(step) => setStudyTextScales({ [row.key]: step })}
            />
            <p
              className="text-white/85"
              style={{
                fontSize: row.baseSize * scale,
                lineHeight: `${Math.round(row.baseSize * 1.4 * scale)}px`,
              }}
            >
              {row.preview}
            </p>
          </div>
        );
      })}
    </section>
  );
}
