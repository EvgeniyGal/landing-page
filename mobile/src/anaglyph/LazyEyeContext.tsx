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
  patchDeviceTextScalePrefs,
  readDeviceTextScalePrefs,
  writeDeviceTextScalePrefs,
} from "@/src/lib/device-text-scale";
import {
  DEFAULT_DEVICE_TEXT_SCALE_PREFS,
  modeFromLazyEye,
  type DeviceTextScalePrefs,
  type StudyMode,
  type StudyTextScales,
} from "@/src/lib/text-scale";

type LazyEyeContextValue = StudyTextScales & {
  lazyEyeEnabled: boolean;
  activeProfile: AnaglyphProfile | null;
  profiles: AnaglyphProfile[];
  textScalePrefs: DeviceTextScalePrefs;
  loading: boolean;
  setLazyEyeEnabled: (enabled: boolean) => Promise<void>;
  setStudyTextScales: (patch: Partial<StudyTextScales>, mode?: StudyMode) => Promise<void>;
  activateProfile: (profileId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const LazyEyeContext = createContext<LazyEyeContextValue | null>(null);

export function LazyEyeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lazyEyeEnabled, setEnabled] = useState(false);
  const [textScalePrefs, setTextScalePrefs] = useState<DeviceTextScalePrefs>(() => ({
    regular: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.regular },
    lazyEye: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.lazyEye },
  }));
  const [profiles, setProfiles] = useState<AnaglyphProfile[]>([]);
  const [localActiveId, setLocalActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setEnabled(false);
      setTextScalePrefs({
        regular: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.regular },
        lazyEye: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.lazyEye },
      });
      setProfiles([]);
      setLocalActiveId(null);
      setLoading(false);
      return;
    }
    const [preferences, listed, storedId, storedScales] = await Promise.all([
      getPreferences(),
      listAnaglyphProfiles(),
      readActiveAnaglyphProfileId(),
      readDeviceTextScalePrefs(),
    ]);
    setEnabled(preferences.preferences.lazyEyeEnabled);
    setTextScalePrefs(storedScales);
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
          setTextScalePrefs({
            regular: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.regular },
            lazyEye: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.lazyEye },
          });
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

  const setStudyTextScales = useCallback(
    async (patch: Partial<StudyTextScales>, mode?: StudyMode) => {
      const targetMode = mode ?? modeFromLazyEye(lazyEyeEnabled);
      setTextScalePrefs((current) => {
        const next = patchDeviceTextScalePrefs(current, targetMode, patch);
        void writeDeviceTextScalePrefs(next);
        return next;
      });
    },
    [lazyEyeEnabled],
  );

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
  const activeScales = textScalePrefs[modeFromLazyEye(lazyEyeEnabled)];

  const value = useMemo(
    () => ({
      lazyEyeEnabled,
      wordTextScale: activeScales.wordTextScale,
      exampleTextScale: activeScales.exampleTextScale,
      explanationTextScale: activeScales.explanationTextScale,
      textScalePrefs,
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
      activeScales,
      textScalePrefs,
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
