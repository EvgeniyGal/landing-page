import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsTabs } from "@/components/app/settings-tabs";
import {
  ensureDefaultAnaglyphProfile,
  getOrCreatePreferences,
  serializeAnaglyphProfile,
  serializePreferences,
} from "@/lib/anaglyph/profiles";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profiles, preferences] = await Promise.all([
    ensureDefaultAnaglyphProfile(session.user.id),
    getOrCreatePreferences(session.user.id),
  ]);
  const serialized = profiles.map(serializeAnaglyphProfile);
  const prefs = serializePreferences(preferences);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-8 text-white/50">Loading settings…</div>
      }
    >
      <SettingsTabs
        profiles={serialized}
        srsPrefs={{
          srsIntervalModifier: prefs.srsIntervalModifier,
          srsStartingEase: prefs.srsStartingEase,
          srsEasyBonus: prefs.srsEasyBonus,
          srsHardInterval: prefs.srsHardInterval,
        }}
      />
    </Suspense>
  );
}
