"use client";

import { createContext, useContext, useMemo, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLazyEyeEnabledAction } from "@/app/app/actions";
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
  setLazyEyeEnabled: (enabled: boolean) => void;
  pending: boolean;
};

const LazyEyeContext = createContext<LazyEyeContextValue | null>(null);

export function LazyEyeProvider({
  lazyEyeEnabled,
  activeProfile,
  children,
}: {
  lazyEyeEnabled: boolean;
  activeProfile: LazyEyeProfile | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(lazyEyeEnabled);

  const value = useMemo<LazyEyeContextValue>(
    () => ({
      lazyEyeEnabled: optimisticEnabled,
      activeProfile,
      pending,
      setLazyEyeEnabled: (enabled: boolean) => {
        startTransition(async () => {
          setOptimisticEnabled(enabled);
          await setLazyEyeEnabledAction(enabled);
          router.refresh();
        });
      },
    }),
    [optimisticEnabled, activeProfile, pending, router, setOptimisticEnabled],
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
