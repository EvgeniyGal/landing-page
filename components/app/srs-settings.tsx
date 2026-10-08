"use client";

import { useMemo, useState, useTransition } from "react";
import { setPreferencesAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_SRS_CONFIG,
  SRS_FIELD_META,
  normalizeSrsConfig,
  type SrsTunableKey,
} from "@/lib/srs/config";

type SrsPrefs = {
  srsIntervalModifier: number;
  srsStartingEase: number;
  srsEasyBonus: number;
  srsHardInterval: number;
};

const FIELD_KEYS: SrsTunableKey[] = [
  "intervalModifier",
  "startingEase",
  "easyBonus",
  "hardInterval",
];

const PREF_KEY: Record<SrsTunableKey, keyof SrsPrefs> = {
  intervalModifier: "srsIntervalModifier",
  startingEase: "srsStartingEase",
  easyBonus: "srsEasyBonus",
  hardInterval: "srsHardInterval",
};

function toPrefs(config: {
  intervalModifier: number;
  startingEase: number;
  easyBonus: number;
  hardInterval: number;
}): SrsPrefs {
  return {
    srsIntervalModifier: config.intervalModifier,
    srsStartingEase: config.startingEase,
    srsEasyBonus: config.easyBonus,
    srsHardInterval: config.hardInterval,
  };
}

export function SrsSettings({ initial }: { initial: SrsPrefs }) {
  const [draft, setDraft] = useState(() =>
    toPrefs(
      normalizeSrsConfig({
        intervalModifier: initial.srsIntervalModifier,
        startingEase: initial.srsStartingEase,
        easyBonus: initial.srsEasyBonus,
        hardInterval: initial.srsHardInterval,
      }),
    ),
  );
  const [saved, setSaved] = useState(draft);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  function setField(key: SrsTunableKey, value: number) {
    const prefKey = PREF_KEY[key];
    setDraft((current) => {
      const next = { ...current, [prefKey]: value };
      return toPrefs(
        normalizeSrsConfig({
          intervalModifier: next.srsIntervalModifier,
          startingEase: next.srsStartingEase,
          easyBonus: next.srsEasyBonus,
          hardInterval: next.srsHardInterval,
        }),
      );
    });
  }

  function onReset() {
    setDraft(toPrefs(DEFAULT_SRS_CONFIG));
    setError(null);
  }

  function onSave() {
    setError(null);
    startTransition(async () => {
      const result = await setPreferencesAction(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const next = toPrefs({
        intervalModifier: result.preferences.srsIntervalModifier,
        startingEase: result.preferences.srsStartingEase,
        easyBonus: result.preferences.srsEasyBonus,
        hardInterval: result.preferences.srsHardInterval,
      });
      setDraft(next);
      setSaved(next);
    });
  }

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1a1a1a] p-5">
      <div>
        <h2 className="text-xl font-semibold">Spaced repetition</h2>
        <p className="mt-1 text-sm text-white/50">
          Synced across devices. Changes apply to future reviews only — existing due dates stay as they
          are until you rate the card again.
        </p>
      </div>

      <div className="space-y-5">
        {FIELD_KEYS.map((key) => {
          const meta = SRS_FIELD_META[key];
          const prefKey = PREF_KEY[key];
          const value = draft[prefKey];
          return (
            <div key={key} className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label htmlFor={`srs-${key}`} className="text-sm font-semibold text-white">
                  {meta.label}
                </label>
                <span className="font-mono text-sm text-[#7eb6ff]">{value.toFixed(2)}</span>
              </div>
              <input
                id={`srs-${key}`}
                type="range"
                min={meta.min}
                max={meta.max}
                step={meta.step}
                value={value}
                onChange={(event) => setField(key, Number(event.target.value))}
                className="w-full accent-[#3d8bff]"
              />
              <div className="flex justify-between text-[11px] text-white/35">
                <span>{meta.min}</span>
                <span>{meta.max}</span>
              </div>
              <p className="text-xs leading-5 text-white/55">{meta.help}</p>
              <p className="text-xs text-white/40">{meta.example(value)}</p>
            </div>
          );
        })}
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={pending || !dirty}
          onClick={onSave}
          className="bg-[#3d8bff] text-white hover:bg-[#2f7af0]"
        >
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onReset}
          className="border-white/15 bg-transparent text-white hover:bg-white/5"
        >
          Reset to defaults
        </Button>
      </div>
    </section>
  );
}
