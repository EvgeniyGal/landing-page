import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getPreferences,
  listAnaglyphProfiles,
  setPreferences,
} from "@/src/api/endpoints";
import type { AnaglyphProfile } from "@/src/api/types";
import { useAuth } from "@/src/auth/session";

type LazyEyeContextValue = {
  lazyEyeEnabled: boolean;
  activeProfile: AnaglyphProfile | null;
  loading: boolean;
  setLazyEyeEnabled: (enabled: boolean) => Promise<void>;
  refresh: () => Promise<void>;
};

const LazyEyeContext = createContext<LazyEyeContextValue | null>(null);

export function LazyEyeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lazyEyeEnabled, setEnabled] = useState(false);
  const [activeProfile, setActiveProfile] = useState<AnaglyphProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setEnabled(false);
      setActiveProfile(null);
      setLoading(false);
      return;
    }
    const [preferences, profiles] = await Promise.all([getPreferences(), listAnaglyphProfiles()]);
    setEnabled(preferences.preferences.lazyEyeEnabled);
    setActiveProfile(profiles.profiles.find((profile) => profile.isActive) ?? profiles.profiles[0] ?? null);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        await refresh();
      } catch {
        if (!cancelled) {
          setEnabled(false);
          setActiveProfile(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const setLazyEyeEnabled = useCallback(async (enabled: boolean) => {
    setEnabled(enabled);
    await setPreferences(enabled);
  }, []);

  const value = useMemo(
    () => ({
      lazyEyeEnabled,
      activeProfile,
      loading,
      setLazyEyeEnabled,
      refresh,
    }),
    [lazyEyeEnabled, activeProfile, loading, setLazyEyeEnabled, refresh],
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
