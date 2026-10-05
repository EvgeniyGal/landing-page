"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  activateAnaglyphProfileAction,
  createAnaglyphProfileAction,
  deleteAnaglyphProfileAction,
  updateAnaglyphProfileAction,
} from "@/app/app/actions";
import { AnaglyphColorPicker } from "@/components/app/anaglyph-color-picker";
import { DichopticText } from "@/components/app/dichoptic-text";
import type { LazyEyeProfile } from "@/components/app/lazy-eye-provider";
import {
  backgroundCss,
  eyeColor,
  neutralForeground,
  type EyeSide,
} from "@/lib/anaglyph/color";
import type { AnaglyphBackground } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GlassProfilesSettings({ profiles: initialProfiles }: { profiles: LazyEyeProfile[] }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [selectedId, setSelectedId] = useState(
    initialProfiles.find((profile) => profile.isActive)?.id ?? initialProfiles[0]?.id ?? "",
  );
  const [eye, setEye] = useState<EyeSide>("left");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = profiles.find((profile) => profile.id === selectedId) ?? profiles[0] ?? null;

  const colors = useMemo(
    () =>
      selected
        ? {
            leftHue: selected.leftHue,
            leftLightness: selected.leftLightness,
            rightHue: selected.rightHue,
            rightLightness: selected.rightLightness,
          }
        : null,
    [selected],
  );

  function patchSelected(patch: Partial<LazyEyeProfile>) {
    if (!selected) {
      return;
    }
    setProfiles((current) =>
      current.map((profile) => (profile.id === selected.id ? { ...profile, ...patch } : profile)),
    );
  }

  function saveSelected() {
    if (!selected) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateAnaglyphProfileAction(selected.id, {
        name: selected.name,
        leftHue: selected.leftHue,
        leftLightness: selected.leftLightness,
        rightHue: selected.rightHue,
        rightLightness: selected.rightLightness,
        background: selected.background,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function onCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createAnaglyphProfileAction({
        name: `Screen ${profiles.length + 1}`,
        leftHue: 0,
        leftLightness: 50,
        rightHue: 180,
        rightLightness: 50,
        background: "black",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setProfiles((current) => [...current, result.profile]);
      setSelectedId(result.profile.id);
      router.refresh();
    });
  }

  function onActivate(profileId: string) {
    setError(null);
    startTransition(async () => {
      const result = await activateAnaglyphProfileAction(profileId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setProfiles((current) =>
        current.map((profile) => ({ ...profile, isActive: profile.id === profileId })),
      );
      setSelectedId(profileId);
      router.refresh();
    });
  }

  function onDelete(profileId: string) {
    if (profiles.length <= 1) {
      setError("Keep at least one glasses profile.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteAnaglyphProfileAction(profileId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const next = profiles.filter((profile) => profile.id !== profileId);
      setProfiles(next);
      setSelectedId(next.find((profile) => profile.isActive)?.id ?? next[0]?.id ?? "");
      router.refresh();
    });
  }

  if (!selected || !colors) {
    return (
      <div className="rounded-2xl bg-[#1a1a1a] p-6">
        <p className="text-white/60">No glasses profiles yet.</p>
        <Button className="mt-4" onClick={onCreate} disabled={pending}>
          Create profile
        </Button>
      </div>
    );
  }

  const previewBg = backgroundCss(selected.background);
  const previewFg = neutralForeground(selected.background);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Glasses settings</h1>
          <p className="mt-1 text-sm text-white/50">
            Save one profile per screen — phones and monitors need different colors.
          </p>
        </div>
        <Button variant="outline" onClick={onCreate} disabled={pending} className="border-white/15 bg-transparent">
          Add profile
        </Button>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            onClick={() => setSelectedId(profile.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              profile.id === selected.id
                ? "bg-[#3d8bff] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/15"
            }`}
          >
            {profile.name}
            {profile.isActive ? " · active" : ""}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl bg-[#1a1a1a] p-5">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-wide text-white/45">Profile name</span>
            <Input
              value={selected.name}
              onChange={(event) => patchSelected({ name: event.target.value })}
              className="border-white/10 bg-[#141414] text-white"
            />
          </label>

          <AnaglyphColorPicker
            eye={eye}
            hue={eye === "left" ? selected.leftHue : selected.rightHue}
            lightness={eye === "left" ? selected.leftLightness : selected.rightLightness}
            onEyeChange={setEye}
            onHueChange={(hue) =>
              patchSelected(eye === "left" ? { leftHue: hue } : { rightHue: hue })
            }
            onLightnessChange={(lightness) =>
              patchSelected(eye === "left" ? { leftLightness: lightness } : { rightLightness: lightness })
            }
          />

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wide text-white/45">Background</span>
            <div className="flex gap-2">
              {(["black", "gray", "white"] as AnaglyphBackground[]).map((background) => (
                <button
                  key={background}
                  type="button"
                  onClick={() => patchSelected({ background })}
                  className={`rounded-xl px-3 py-2 text-sm capitalize ${
                    selected.background === background
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/75"
                  }`}
                >
                  {background}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveSelected} disabled={pending}>
              Save
            </Button>
            {!selected.isActive ? (
              <Button variant="outline" className="border-white/15 bg-transparent" onClick={() => onActivate(selected.id)} disabled={pending}>
                Set active
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="border-red-400/30 bg-transparent text-red-200"
              onClick={() => onDelete(selected.id)}
              disabled={pending || profiles.length <= 1}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 p-5" style={{ background: previewBg, color: previewFg }}>
          <p className="text-xs uppercase tracking-wide opacity-60">Live preview</p>
          <p className="text-3xl font-semibold">
            <DichopticText text="abolish" colors={colors} mode="letters" neutralColor={previewFg} />
          </p>
          <p className="text-lg">
            <DichopticText text="(verb)" colors={colors} mode="letters" neutralColor={previewFg} />
          </p>
          <p className="text-base opacity-90">
            <DichopticText text="/əˈbɒlɪʃ/" colors={colors} mode="letters" neutralColor={previewFg} />
          </p>
          <hr className="border-current/20" />
          <p className="leading-7">
            <DichopticText
              text="The government decided to abolish the outdated law."
              colors={colors}
              mode="syllables"
              neutralColor={previewFg}
            />
          </p>
          <div className="flex gap-3 pt-2">
            <div
              className="h-10 w-10 rounded-full border border-white/20"
              style={{ background: eyeColor(colors, "left") }}
              title="Left"
            />
            <div
              className="h-10 w-10 rounded-full border border-white/20"
              style={{ background: eyeColor(colors, "right") }}
              title="Right"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
