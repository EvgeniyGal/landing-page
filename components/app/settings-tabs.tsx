"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GlassProfilesSettings } from "@/components/app/glass-profiles-settings";
import type { LazyEyeProfile } from "@/components/app/lazy-eye-provider";
import { SrsSettings } from "@/components/app/srs-settings";
import { StudyTextScaleSettings } from "@/components/app/study-text-scale-settings";

type SettingsTab = "text" | "glasses" | "srs";

function parseTab(value: string | null): SettingsTab {
  if (value === "glasses") {
    return "glasses";
  }
  if (value === "srs") {
    return "srs";
  }
  return "text";
}

export function SettingsTabs({
  profiles,
  srsPrefs,
}: {
  profiles: LazyEyeProfile[];
  srsPrefs: {
    srsIntervalModifier: number;
    srsStartingEase: number;
    srsEasyBonus: number;
    srsHardInterval: number;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  function setTab(next: SettingsTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "text") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }
    const query = params.toString();
    router.replace(query ? `/app/settings?${query}` : "/app/settings");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-white/50">
          Text size and active glasses are remembered on this device. Spaced repetition coefficients
          sync across devices.
        </p>
      </div>

      <div className="flex w-fit flex-wrap items-center rounded-full bg-white/8 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setTab("text")}
          className={`rounded-full px-4 py-1.5 transition ${
            tab === "text" ? "bg-white text-black" : "text-white/65 hover:text-white"
          }`}
        >
          Text size
        </button>
        <button
          type="button"
          onClick={() => setTab("glasses")}
          className={`rounded-full px-4 py-1.5 transition ${
            tab === "glasses" ? "bg-white text-black" : "text-white/65 hover:text-white"
          }`}
        >
          Glasses
        </button>
        <button
          type="button"
          onClick={() => setTab("srs")}
          className={`rounded-full px-4 py-1.5 transition ${
            tab === "srs" ? "bg-white text-black" : "text-white/65 hover:text-white"
          }`}
        >
          Spaced repetition
        </button>
      </div>

      {tab === "text" ? (
        <StudyTextScaleSettings />
      ) : tab === "glasses" ? (
        <GlassProfilesSettings profiles={profiles} />
      ) : (
        <SrsSettings initial={srsPrefs} />
      )}
    </div>
  );
}
