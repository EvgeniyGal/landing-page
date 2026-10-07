import * as SecureStore from "expo-secure-store";
import {
  DEFAULT_DEVICE_TEXT_SCALE_PREFS,
  parseDeviceTextScalePrefs,
  type DeviceTextScalePrefs,
  type StudyMode,
  type StudyTextScales,
} from "@/src/lib/text-scale";

export const DEVICE_TEXT_SCALE_KEY = "study.textScales";

export async function readDeviceTextScalePrefs(): Promise<DeviceTextScalePrefs> {
  try {
    const raw = await SecureStore.getItemAsync(DEVICE_TEXT_SCALE_KEY);
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

export async function writeDeviceTextScalePrefs(prefs: DeviceTextScalePrefs): Promise<void> {
  try {
    await SecureStore.setItemAsync(DEVICE_TEXT_SCALE_KEY, JSON.stringify(prefs));
  } catch {
    // SecureStore can fail on some web/dev targets; in-memory values still work.
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
