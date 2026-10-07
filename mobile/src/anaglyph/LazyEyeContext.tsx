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
import {
  readActiveAnaglyphProfileId,
  resolveActiveProfileId,
  withLocalActiveFlag,
  writeActiveAnaglyphProfileId,
} from "@/src/lib/device-profile";
import {
  DEFAULT_TEXT_SCALE,
  serializeStudyTextScales,
  type StudyTextScales,
} from "@/src/lib/text-scale";

type LazyEyeContextValue = StudyTextScales & {
  lazyEyeEnabled: boolean;
  activeProfile: AnaglyphProfile | null;
  profiles: AnaglyphProfile[];
  loading: boolean;
  setLazyEyeEnabled: (enabled: boolean) => Promise<void>;
  setStudyTextScales: (patch: Partial<StudyTextScales>) => Promise<void>;
  activateProfile: (profileId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const LazyEyeContext = createContext<LazyEyeContextValue | null>(null);

const DEFAULT_SCALES: StudyTextScales = {
  wordTextScale: DEFAULT_TEXT_SCALE,
  exampleTextScale: DEFAULT_TEXT_SCALE,
  explanationTextScale: DEFAULT_TEXT_SCALE,
};

export function LazyEyeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lazyEyeEnabled, setEnabled] = useState(false);
  const [scales, setScales] = useState<StudyTextScales>(DEFAULT_SCALES);
  const [profiles, setProfiles] = useState<AnaglyphProfile[]>([]);
  const [localActiveId, setLocalActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setEnabled(false);
      setScales(DEFAULT_SCALES);
      setProfiles([]);
      setLocalActiveId(null);
      setLoading(false);
      return;
    }
    const [preferences, listed, storedId] = await Promise.all([
      getPreferences(),
      listAnaglyphProfiles(),
      readActiveAnaglyphProfileId(),
    ]);
    setEnabled(preferences.preferences.lazyEyeEnabled);
    setScales(serializeStudyTextScales(preferences.preferences));
    setProfiles(listed.profiles);
    const resolved = resolveActiveProfileId(listed.profiles, storedId);
    setLocalActiveId(resolved);
    if (resolved && resolved !== storedId) {
      await writeActiveAnaglyphProfileId(resolved);
    }
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
          setScales(DEFAULT_SCALES);
          setProfiles([]);
          setLocalActiveId(null);
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
    await setPreferences({ lazyEyeEnabled: enabled });
  }, []);

  const setStudyTextScales = useCallback(async (patch: Partial<StudyTextScales>) => {
    setScales((current) => ({ ...current, ...patch }));
    const result = await setPreferences(patch);
    setScales(serializeStudyTextScales(result.preferences));
  }, []);

  const activateProfile = useCallback(async (profileId: string) => {
    setLocalActiveId(profileId);
    await writeActiveAnaglyphProfileId(profileId);
  }, []);

  const activeId = resolveActiveProfileId(profiles, localActiveId);
  const localProfiles = useMemo(
    () => withLocalActiveFlag(profiles, activeId),
    [profiles, activeId],
  );
  const activeProfile =
    localProfiles.find((profile) => profile.id === activeId) ?? localProfiles[0] ?? null;

  const value = useMemo(
    () => ({
      lazyEyeEnabled,
      wordTextScale: scales.wordTextScale,
      exampleTextScale: scales.exampleTextScale,
      explanationTextScale: scales.explanationTextScale,
      activeProfile,
      profiles: localProfiles,
      loading,
      setLazyEyeEnabled,
      setStudyTextScales,
      activateProfile,
      refresh,
    }),
    [
      lazyEyeEnabled,
      scales,
      activeProfile,
      localProfiles,
      loading,
      setLazyEyeEnabled,
      setStudyTextScales,
      activateProfile,
      refresh,
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
