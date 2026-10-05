"use client";

import { createContext, useContext, useMemo, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { activateAnaglyphProfileAction, setLazyEyeEnabledAction } from "@/app/app/actions";
import type { AnaglyphBackground } from "@/lib/db/schema";

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

type LazyEyeContextValue = {
  lazyEyeEnabled: boolean;
  activeProfile: LazyEyeProfile | null;
  profiles: LazyEyeProfile[];
  setLazyEyeEnabled: (enabled: boolean) => void;
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
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(lazyEyeEnabled);
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
      optimisticActive,
      optimisticProfiles,
      pending,
      router,
      setOptimisticEnabled,
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
