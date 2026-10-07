"use client";

import { createContext, useContext, useMemo, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  activateAnaglyphProfileAction,
  setLazyEyeEnabledAction,
  setPreferencesAction,
} from "@/app/app/actions";
import type { AnaglyphBackground } from "@/lib/db/schema";
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
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(lazyEyeEnabled);
  const [optimisticScales, setOptimisticScales] = useOptimistic(
    { wordTextScale, exampleTextScale, explanationTextScale },
    (current, patch: Partial<StudyTextScales>) => ({ ...current, ...patch }),
  );
  const [optimisticProfiles, setActiveProfileId] = useOptimistic(
    profiles,
    (current, profileId: string) =>
      current.map((profile) => ({ ...profile, isActive: profile.id === profileId })),
  );

  const optimisticActive =
    optimisticProfiles.find((profile) => profile.isActive) ?? activeProfile;

  const value = useMemo<LazyEyeContextValue>(
    () => ({
      lazyEyeEnabled: optimisticEnabled,
      wordTextScale: optimisticScales.wordTextScale,
      exampleTextScale: optimisticScales.exampleTextScale,
      explanationTextScale: optimisticScales.explanationTextScale,
      activeProfile: optimisticActive,
      profiles: optimisticProfiles,
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
        startTransition(async () => {
          setActiveProfileId(profileId);
          await activateAnaglyphProfileAction(profileId);
          router.refresh();
        });
      },
    }),
    [
      optimisticEnabled,
      optimisticScales,
      optimisticActive,
      optimisticProfiles,
      pending,
      router,
      setOptimisticEnabled,
      setOptimisticScales,
      setActiveProfileId,
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

