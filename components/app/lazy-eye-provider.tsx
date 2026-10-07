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
import { setLazyEyeEnabledAction, setPreferencesAction } from "@/app/app/actions";
import type { AnaglyphBackground } from "@/lib/db/schema";
import {
  readActiveAnaglyphProfileId,
  resolveActiveProfileId,
  withLocalActiveFlag,
  writeActiveAnaglyphProfileId,
} from "@/lib/anaglyph/device-profile";
import {
  DEFAULT_TEXT_SCALE,
  type StudyTextScales,
  type TextScaleStep,
} from "@/lib/study/text-scale";

export type LazyEyeProfile = {
  id: string;
  name: string;
  isActive: boolean;
  leftHue: number;
  leftLightness: number;
  rightHue: number;
  rightLightness: number;
  background: AnaglyphBackground;
};

type LazyEyeContextValue = StudyTextScales & {
  lazyEyeEnabled: boolean;
  activeProfile: LazyEyeProfile | null;
  profiles: LazyEyeProfile[];
  setLazyEyeEnabled: (enabled: boolean) => void;
  setStudyTextScales: (patch: Partial<StudyTextScales>) => void;
  activateProfile: (profileId: string) => void;
  pending: boolean;
};

const LazyEyeContext = createContext<LazyEyeContextValue | null>(null);

export function LazyEyeProvider({
  lazyEyeEnabled,
  wordTextScale = DEFAULT_TEXT_SCALE,
  exampleTextScale = DEFAULT_TEXT_SCALE,
  explanationTextScale = DEFAULT_TEXT_SCALE,
  activeProfile,
  profiles,
  children,
}: {
  lazyEyeEnabled: boolean;
  wordTextScale?: TextScaleStep;
  exampleTextScale?: TextScaleStep;
  explanationTextScale?: TextScaleStep;
  activeProfile: LazyEyeProfile | null;
  profiles: LazyEyeProfile[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [localActiveId, setLocalActiveId] = useState<string | null>(
    () => activeProfile?.id ?? profiles[0]?.id ?? null,
  );
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(lazyEyeEnabled);
  const [optimisticScales, setOptimisticScales] = useOptimistic(
    { wordTextScale, exampleTextScale, explanationTextScale },
    (current, patch: Partial<StudyTextScales>) => ({ ...current, ...patch }),
  );

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

  const value = useMemo<LazyEyeContextValue>(
    () => ({
      lazyEyeEnabled: optimisticEnabled,
      wordTextScale: optimisticScales.wordTextScale,
      exampleTextScale: optimisticScales.exampleTextScale,
      explanationTextScale: optimisticScales.explanationTextScale,
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
      setStudyTextScales: (patch: Partial<StudyTextScales>) => {
        startTransition(async () => {
          setOptimisticScales(patch);
          await setPreferencesAction(patch);
          router.refresh();
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
      optimisticScales,
      localActive,
      localProfiles,
      pending,
      profiles,
      router,
      setOptimisticEnabled,
      setOptimisticScales,
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
