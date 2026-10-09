"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { setLazyEyeEnabledAction } from "@/app/app/actions";
import type { AnaglyphBackground } from "@/lib/db/schema";
import {
  readActiveAnaglyphProfileId,
  resolveActiveProfileId,
  withLocalActiveFlag,
  writeActiveAnaglyphProfileId,
} from "@/lib/anaglyph/device-profile";
import {
  patchDeviceTextScalePrefs,
  readDeviceTextScalePrefs,
  writeDeviceTextScalePrefs,
} from "@/lib/study/device-text-scale";
import {
  DEFAULT_DEVICE_TEXT_SCALE_PREFS,
  modeFromLazyEye,
  type DeviceTextScalePrefs,
  type StudyMode,
  type StudyTextScales,
} from "@/lib/study/text-scale";

export type LazyEyeProfile = {
  id: string;
  name: string;
  isActive: boolean;
  leftHue: number;
  leftLightness: number;
  rightHue: number;
  rightLightness: number;
  strongEye: "left" | "right";
  strongEyeWeaken: number;
  background: AnaglyphBackground;
};

type LazyEyeContextValue = StudyTextScales & {
  lazyEyeEnabled: boolean;
  activeProfile: LazyEyeProfile | null;
  profiles: LazyEyeProfile[];
  textScalePrefs: DeviceTextScalePrefs;
  setLazyEyeEnabled: (enabled: boolean) => void;
  setStudyTextScales: (patch: Partial<StudyTextScales>, mode?: StudyMode) => void;
  activateProfile: (profileId: string) => void;
  pending: boolean;
};

const LazyEyeContext = createContext<LazyEyeContextValue | null>(null);

export function LazyEyeProvider({
  lazyEyeEnabled,
  activeProfile,
  profiles,
  children,
}: {
  lazyEyeEnabled: boolean;
  activeProfile: LazyEyeProfile | null;
  profiles: LazyEyeProfile[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [localActiveId, setLocalActiveId] = useState<string | null>(
    () => activeProfile?.id ?? profiles[0]?.id ?? null,
  );
  const [textScalePrefs, setTextScalePrefs] = useState<DeviceTextScalePrefs>(() => ({
    regular: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.regular },
    lazyEye: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.lazyEye },
  }));
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(lazyEyeEnabled);

  useEffect(() => {
    setTextScalePrefs(readDeviceTextScalePrefs());
  }, []);

  useEffect(() => {
    const stored = readActiveAnaglyphProfileId();
    const resolved = resolveActiveProfileId(profiles, stored);
    setLocalActiveId(resolved);
    if (resolved && resolved !== stored) {
      writeActiveAnaglyphProfileId(resolved);
    }
  }, [profiles]);

  const activeId = resolveActiveProfileId(profiles, localActiveId);
  const localProfiles = useMemo(
    () => withLocalActiveFlag(profiles, activeId),
    [profiles, activeId],
  );
  const localActive =
    localProfiles.find((profile) => profile.id === activeId) ?? activeProfile ?? null;

  const activeScales = textScalePrefs[modeFromLazyEye(optimisticEnabled)];

  const value = useMemo<LazyEyeContextValue>(
    () => ({
      lazyEyeEnabled: optimisticEnabled,
      wordTextScale: activeScales.wordTextScale,
      exampleTextScale: activeScales.exampleTextScale,
      explanationTextScale: activeScales.explanationTextScale,
      textScalePrefs,
      activeProfile: localActive,
      profiles: localProfiles,
      pending,
      setLazyEyeEnabled: (enabled: boolean) => {
        startTransition(async () => {
          setOptimisticEnabled(enabled);
          await setLazyEyeEnabledAction(enabled);
          router.refresh();
        });
      },
      setStudyTextScales: (patch: Partial<StudyTextScales>, mode?: StudyMode) => {
        const targetMode = mode ?? modeFromLazyEye(optimisticEnabled);
        setTextScalePrefs((current) => {
          const next = patchDeviceTextScalePrefs(current, targetMode, patch);
          writeDeviceTextScalePrefs(next);
          return next;
        });
      },
      activateProfile: (profileId: string) => {
        if (!profiles.some((profile) => profile.id === profileId)) {
          return;
        }
        setLocalActiveId(profileId);
        writeActiveAnaglyphProfileId(profileId);
      },
    }),
    [
      optimisticEnabled,
      activeScales,
      textScalePrefs,
      localActive,
      localProfiles,
      pending,
      profiles,
      router,
      setOptimisticEnabled,
    ],
  );

  return <LazyEyeContext.Provider value={value}>{children}</LazyEyeContext.Provider>;
}

export function useLazyEye() {
  const value = useContext(LazyEyeContext);
  if (!value) {
    throw new Error("useLazyEye must be used within LazyEyeProvider");
  }
  return value;
}
