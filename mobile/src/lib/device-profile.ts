import * as SecureStore from "expo-secure-store";

export const ACTIVE_ANAGLYPH_PROFILE_KEY = "anaglyph.activeProfileId";

export async function readActiveAnaglyphProfileId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACTIVE_ANAGLYPH_PROFILE_KEY);
  } catch {
    return null;
  }
}

export async function writeActiveAnaglyphProfileId(profileId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACTIVE_ANAGLYPH_PROFILE_KEY, profileId);
  } catch {
    // SecureStore can fail on some web/dev targets; in-memory selection still works.
  }
}

export function resolveActiveProfileId<T extends { id: string; isActive: boolean }>(
  profiles: T[],
  preferredId: string | null | undefined,
): string | null {
  if (preferredId && profiles.some((profile) => profile.id === preferredId)) {
    return preferredId;
  }
  return profiles.find((profile) => profile.isActive)?.id ?? profiles[0]?.id ?? null;
}

export function withLocalActiveFlag<T extends { id: string; isActive: boolean }>(
  profiles: T[],
  activeId: string | null,
): T[] {
  return profiles.map((profile) => ({
    ...profile,
    isActive: profile.id === activeId,
  }));
}
