export const ACTIVE_ANAGLYPH_PROFILE_KEY = "anaglyph.activeProfileId";

export function readActiveAnaglyphProfileId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(ACTIVE_ANAGLYPH_PROFILE_KEY);
  } catch {
    return null;
  }
}

export function writeActiveAnaglyphProfileId(profileId: string) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(ACTIVE_ANAGLYPH_PROFILE_KEY, profileId);
  } catch {
    // Ignore quota / private-mode failures; in-memory selection still works.
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
