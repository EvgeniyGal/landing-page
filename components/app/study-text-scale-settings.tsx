"use client";

import { useLazyEye } from "@/components/app/lazy-eye-provider";
import {
  TEXT_SCALE_LABELS,
  TEXT_SCALE_STEPS,
  type StudyMode,
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

const MODE_SECTIONS: { mode: StudyMode; title: string; hint: string }[] = [
  {
    mode: "regular",
    title: "Regular",
    hint: "Used when Regular mode is selected on this device.",
  },
  {
    mode: "lazyEye",
    title: "Lazy eye",
    hint: "Used when Lazy eye mode is selected on this device.",
  },
];

function ScaleChips({
  value,
  onChange,
}: {
  value: TextScaleStep;
  onChange: (step: TextScaleStep) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEXT_SCALE_STEPS.map((step) => {
        const active = value === step;
        return (
          <button
            key={step}
            type="button"
            onClick={() => onChange(step)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-white text-black"
                : "bg-white/10 text-white/75 hover:bg-white/15 hover:text-white"
            }`}
          >
            {TEXT_SCALE_LABELS[step]}
          </button>
        );
      })}
    </div>
  );
}

export function StudyTextScaleSettings() {
  const { textScalePrefs, setStudyTextScales, lazyEyeEnabled } = useLazyEye();

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1a1a1a] p-5">
      <div>
        <h2 className="text-xl font-semibold">Text size</h2>
        <p className="mt-1 text-sm text-white/50">
          Saved on this device only. Configure Regular and Lazy eye independently.
        </p>
      </div>

      {MODE_SECTIONS.map((section) => {
        const scales = textScalePrefs[section.mode];
        const isCurrent = (section.mode === "lazyEye") === lazyEyeEnabled;
        return (
          <div key={section.mode} className="space-y-4 rounded-xl border border-white/8 bg-black/20 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold">{section.title}</h3>
                <p className="mt-0.5 text-xs text-white/45">{section.hint}</p>
              </div>
              {isCurrent ? (
                <span className="rounded-full bg-[#3d8bff]/20 px-2.5 py-1 text-[11px] font-semibold text-[#7eb6ff]">
                  In use
                </span>
              ) : null}
            </div>

            {ROWS.map((row) => {
              const scale = scales[row.key];
              return (
                <div key={row.key} className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/45">
                    {row.label}
                  </span>
                  <ScaleChips
                    value={scale}
                    onChange={(step) => setStudyTextScales({ [row.key]: step }, section.mode)}
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
          </div>
        );
      })}
    </section>
  );
}
