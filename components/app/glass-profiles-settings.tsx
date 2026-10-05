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
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

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

  function choosePreset(profileId: string) {
    setSelectedId(profileId);
    const alreadyActive = profiles.find((profile) => profile.id === profileId)?.isActive;
    if (alreadyActive) {
      return;
    }
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
      router.refresh();
    });
  }

  function saveSelected() {
    if (!selected) {
      return;
    }
    const name = selected.name.trim();
    if (!name) {
      setError("Give these glasses a name.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateAnaglyphProfileAction(selected.id, {
        name,
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
      setProfiles((current) =>
        current.map((profile) =>
          profile.id === selected.id ? { ...profile, ...result.profile } : profile,
        ),
      );
      router.refresh();
    });
  }

  function onCreate() {
    const name = newName.trim();
    if (!name) {
      setError("Enter a name for the new glasses.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createAnaglyphProfileAction({
        name,
        leftHue: selected?.leftHue ?? 0,
        leftLightness: selected?.leftLightness ?? 50,
        rightHue: selected?.rightHue ?? 180,
        rightLightness: selected?.rightLightness ?? 50,
        background: selected?.background ?? "black",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const activate = await activateAnaglyphProfileAction(result.profile.id);
      if (!activate.ok) {
        setError(activate.error);
        return;
      }
      setProfiles((current) => [
        ...current.map((profile) => ({ ...profile, isActive: false })),
        { ...result.profile, isActive: true },
      ]);
      setSelectedId(result.profile.id);
      setCreating(false);
      setNewName("");
      router.refresh();
    });
  }

  function onDelete(profileId: string) {
    if (profiles.length <= 1) {
      setError("Keep at least one glasses preset.");
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
        <p className="text-white/60">No glasses saved yet.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="e.g. Phone, Laptop, Monitor"
            className="border-white/10 bg-[#141414] text-white"
          />
          <Button onClick={onCreate} disabled={pending}>
            Save glasses
          </Button>
        </div>
      </div>
    );
  }

  const previewBg = backgroundCss(selected.background);
  const previewFg = neutralForeground(selected.background);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Glasses</h1>
          <p className="mt-1 text-sm text-white/50">
            Name each pair for a screen, then tap a preset to use it.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setCreating(true);
            setNewName("");
            setError(null);
          }}
          disabled={pending}
          className="border-white/15 bg-transparent"
        >
          Save new glasses
        </Button>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {creating ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 sm:flex-row sm:items-center">
          <Input
            autoFocus
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Glasses name (Phone, Laptop…)"
            className="border-white/10 bg-[#141414] text-white"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onCreate();
              }
            }}
          />
          <div className="flex gap-2">
            <Button onClick={onCreate} disabled={pending}>
              Save
            </Button>
            <Button
              variant="outline"
              className="border-white/15 bg-transparent"
              onClick={() => {
                setCreating(false);
                setNewName("");
              }}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-white/45">
          Choose preset
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {profiles.map((profile) => {
            const profileColors = {
              leftHue: profile.leftHue,
              leftLightness: profile.leftLightness,
              rightHue: profile.rightHue,
              rightLightness: profile.rightLightness,
            };
            const isSelected = profile.id === selected.id;
            return (
              <button
                key={profile.id}
                type="button"
                disabled={pending}
                onClick={() => choosePreset(profile.id)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  profile.isActive
                    ? "border-[#3d8bff] bg-[#3d8bff]/15"
                    : isSelected
                      ? "border-white/25 bg-white/8"
                      : "border-white/10 bg-[#1a1a1a] hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex -space-x-2">
                  <span
                    className="size-8 rounded-full border-2 border-[#1a1a1a]"
                    style={{ background: eyeColor(profileColors, "left") }}
                  />
                  <span
                    className="size-8 rounded-full border-2 border-[#1a1a1a]"
                    style={{ background: eyeColor(profileColors, "right") }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{profile.name}</p>
                  <p className="text-xs capitalize text-white/45">{profile.background} background</p>
                </div>
                {profile.isActive ? (
                  <span className="rounded-full bg-[#3d8bff] px-2.5 py-1 text-xs font-semibold text-white">
                    In use
                  </span>
                ) : (
                  <span className="text-xs text-white/40">Tap to use</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl bg-[#1a1a1a] p-5">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-wide text-white/45">Glasses name</span>
            <Input
              value={selected.name}
              onChange={(event) => patchSelected({ name: event.target.value })}
              placeholder="Phone, Laptop, Office monitor…"
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
              Save changes
            </Button>
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
