import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  anaglyphProfiles,
  userPreferences,
  type AnaglyphBackground,
  type AnaglyphProfile,
} from "@/lib/db/schema";
import { clampHue, clampLightness } from "@/lib/anaglyph/color";
import {
  normalizeSrsConfig,
  serializeSrsPreferences,
} from "@/lib/srs/config";
import {
  serializeStudyTextScales,
  type StudyTextScales,
  type TextScaleStep,
} from "@/lib/study/text-scale";

export type AnaglyphProfileInput = {
  name: string;
  leftHue: number;
  leftLightness: number;
  rightHue: number;
  rightLightness: number;
  background: AnaglyphBackground;
};

export function serializeAnaglyphProfile(profile: AnaglyphProfile) {
  return {
    id: profile.id,
    name: profile.name,
    isActive: profile.isActive,
    leftHue: profile.leftHue,
    leftLightness: profile.leftLightness,
    rightHue: profile.rightHue,
    rightLightness: profile.rightLightness,
    background: profile.background,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

function normalizeProfileInput(input: AnaglyphProfileInput) {
  const name = input.name.trim().slice(0, 255);
  if (!name) {
    return null;
  }
  return {
    name,
    leftHue: clampHue(input.leftHue),
    leftLightness: clampLightness(input.leftLightness),
    rightHue: clampHue(input.rightHue),
    rightLightness: clampLightness(input.rightLightness),
    background: input.background,
  };
}

export async function getOrCreatePreferences(userId: string) {
  const db = getDb();
  const existing = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
  if (existing) {
    return existing;
  }
  const [created] = await db
    .insert(userPreferences)
    .values({ userId, lazyEyeEnabled: false })
    .returning();
  return created!;
}

export type PreferencesPatch = {
  lazyEyeEnabled?: boolean;
  wordTextScale?: TextScaleStep;
  exampleTextScale?: TextScaleStep;
  explanationTextScale?: TextScaleStep;
  srsIntervalModifier?: number;
  srsStartingEase?: number;
  srsEasyBonus?: number;
  srsHardInterval?: number;
};

export function serializePreferences(prefs: {
  lazyEyeEnabled: boolean;
  wordTextScale: number;
  exampleTextScale: number;
  explanationTextScale: number;
  srsIntervalModifier?: number;
  srsStartingEase?: number;
  srsEasyBonus?: number;
  srsHardInterval?: number;
}) {
  return {
    lazyEyeEnabled: prefs.lazyEyeEnabled,
    ...serializeStudyTextScales(prefs),
    ...serializeSrsPreferences(prefs),
  };
}

export async function updatePreferences(userId: string, patch: PreferencesPatch) {
  const db = getDb();
  const current = await getOrCreatePreferences(userId);
  const hasSrsPatch =
    patch.srsIntervalModifier !== undefined ||
    patch.srsStartingEase !== undefined ||
    patch.srsEasyBonus !== undefined ||
    patch.srsHardInterval !== undefined;
  const srsNormalized = hasSrsPatch
    ? normalizeSrsConfig({
        intervalModifier: patch.srsIntervalModifier ?? current.srsIntervalModifier,
        startingEase: patch.srsStartingEase ?? current.srsStartingEase,
        easyBonus: patch.srsEasyBonus ?? current.srsEasyBonus,
        hardInterval: patch.srsHardInterval ?? current.srsHardInterval,
      })
    : null;
  const [updated] = await db
    .update(userPreferences)
    .set({
      ...(patch.lazyEyeEnabled !== undefined ? { lazyEyeEnabled: patch.lazyEyeEnabled } : {}),
      ...(patch.wordTextScale !== undefined ? { wordTextScale: patch.wordTextScale } : {}),
      ...(patch.exampleTextScale !== undefined ? { exampleTextScale: patch.exampleTextScale } : {}),
      ...(patch.explanationTextScale !== undefined
        ? { explanationTextScale: patch.explanationTextScale }
        : {}),
      ...(srsNormalized
        ? {
            srsIntervalModifier: srsNormalized.intervalModifier,
            srsStartingEase: srsNormalized.startingEase,
            srsEasyBonus: srsNormalized.easyBonus,
            srsHardInterval: srsNormalized.hardInterval,
          }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(userPreferences.userId, userId))
    .returning();
  return updated!;
}

export async function setLazyEyeEnabled(userId: string, lazyEyeEnabled: boolean) {
  return updatePreferences(userId, { lazyEyeEnabled });
}

export async function listAnaglyphProfiles(userId: string) {
  const db = getDb();
  return db.query.anaglyphProfiles.findMany({
    where: eq(anaglyphProfiles.userId, userId),
    orderBy: [asc(anaglyphProfiles.createdAt)],
  });
}

export async function getActiveAnaglyphProfile(userId: string) {
  const db = getDb();
  return db.query.anaglyphProfiles.findFirst({
    where: and(eq(anaglyphProfiles.userId, userId), eq(anaglyphProfiles.isActive, true)),
  });
}

export async function ensureDefaultAnaglyphProfile(userId: string) {
  const existing = await listAnaglyphProfiles(userId);
  if (existing.length > 0) {
    if (!existing.some((profile) => profile.isActive)) {
      const db = getDb();
      await db
        .update(anaglyphProfiles)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(anaglyphProfiles.id, existing[0]!.id));
      return listAnaglyphProfiles(userId);
    }
    return existing;
  }

  const db = getDb();
  await db.insert(anaglyphProfiles).values({
    userId,
    name: "Default",
    isActive: true,
    leftHue: 0,
    leftLightness: 50,
    rightHue: 180,
    rightLightness: 50,
    background: "black",
  });
  return listAnaglyphProfiles(userId);
}

export async function createAnaglyphProfile(userId: string, input: AnaglyphProfileInput) {
  const normalized = normalizeProfileInput(input);
  if (!normalized) {
    return { ok: false as const, reason: "invalid_name" as const };
  }
  const db = getDb();
  const current = await listAnaglyphProfiles(userId);
  const [created] = await db
    .insert(anaglyphProfiles)
    .values({
      userId,
      ...normalized,
      isActive: current.length === 0,
    })
    .returning();
  return { ok: true as const, profile: created! };
}

export async function updateAnaglyphProfile(
  userId: string,
  profileId: string,
  input: Partial<AnaglyphProfileInput>,
) {
  const db = getDb();
  const existing = await db.query.anaglyphProfiles.findFirst({
    where: and(eq(anaglyphProfiles.id, profileId), eq(anaglyphProfiles.userId, userId)),
  });
  if (!existing) {
    return { ok: false as const, reason: "not_found" as const };
  }

  const next = normalizeProfileInput({
    name: input.name ?? existing.name,
    leftHue: input.leftHue ?? existing.leftHue,
    leftLightness: input.leftLightness ?? existing.leftLightness,
    rightHue: input.rightHue ?? existing.rightHue,
    rightLightness: input.rightLightness ?? existing.rightLightness,
    background: input.background ?? existing.background,
  });
  if (!next) {
    return { ok: false as const, reason: "invalid_name" as const };
  }

  const [updated] = await db
    .update(anaglyphProfiles)
    .set({ ...next, updatedAt: new Date() })
    .where(eq(anaglyphProfiles.id, profileId))
    .returning();
  return { ok: true as const, profile: updated! };
}

export async function activateAnaglyphProfile(userId: string, profileId: string) {
  const db = getDb();
  const existing = await db.query.anaglyphProfiles.findFirst({
    where: and(eq(anaglyphProfiles.id, profileId), eq(anaglyphProfiles.userId, userId)),
  });
  if (!existing) {
    return { ok: false as const, reason: "not_found" as const };
  }

  await db
    .update(anaglyphProfiles)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(anaglyphProfiles.userId, userId));
  const [updated] = await db
    .update(anaglyphProfiles)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(anaglyphProfiles.id, profileId))
    .returning();
  return { ok: true as const, profile: updated! };
}

export async function deleteAnaglyphProfile(userId: string, profileId: string) {
  const db = getDb();
  const existing = await db.query.anaglyphProfiles.findFirst({
    where: and(eq(anaglyphProfiles.id, profileId), eq(anaglyphProfiles.userId, userId)),
  });
  if (!existing) {
    return { ok: false as const, reason: "not_found" as const };
  }

  await db.delete(anaglyphProfiles).where(eq(anaglyphProfiles.id, profileId));

  if (existing.isActive) {
    const remaining = await listAnaglyphProfiles(userId);
    if (remaining[0]) {
      await db
        .update(anaglyphProfiles)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(anaglyphProfiles.id, remaining[0].id));
    }
  }

  return { ok: true as const };
}

export async function getLazyEyeStudyContext(userId: string) {
  const preferences = await getOrCreatePreferences(userId);
  const profiles = await ensureDefaultAnaglyphProfile(userId);
  const active = profiles.find((profile) => profile.isActive) ?? profiles[0] ?? null;
  const scales = serializeStudyTextScales(preferences);
  return {
    lazyEyeEnabled: preferences.lazyEyeEnabled,
    ...scales,
    activeProfile: active,
    profiles,
  };
}

export type { StudyTextScales };
