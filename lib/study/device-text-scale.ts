import {
  DEFAULT_DEVICE_TEXT_SCALE_PREFS,
  parseDeviceTextScalePrefs,
  type DeviceTextScalePrefs,
  type StudyMode,
  type StudyTextScales,
} from "@/lib/study/text-scale";

export const DEVICE_TEXT_SCALE_KEY = "study.textScales";

export function readDeviceTextScalePrefs(): DeviceTextScalePrefs {
  if (typeof window === "undefined") {
    return {
      regular: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.regular },
      lazyEye: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.lazyEye },
    };
  }
  try {
    const raw = window.localStorage.getItem(DEVICE_TEXT_SCALE_KEY);
    if (!raw) {
      return {
        regular: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.regular },
        lazyEye: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.lazyEye },
      };
    }
    return parseDeviceTextScalePrefs(JSON.parse(raw));
  } catch {
    return {
      regular: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.regular },
      lazyEye: { ...DEFAULT_DEVICE_TEXT_SCALE_PREFS.lazyEye },
    };
  }
}

export function writeDeviceTextScalePrefs(prefs: DeviceTextScalePrefs) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(DEVICE_TEXT_SCALE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore quota / private-mode failures; in-memory values still work.
  }
}

export function patchDeviceTextScalePrefs(
  current: DeviceTextScalePrefs,
  mode: StudyMode,
  patch: Partial<StudyTextScales>,
): DeviceTextScalePrefs {
  return {
    ...current,
    [mode]: { ...current[mode], ...patch },
  };
}
