import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userFromApiRequest } from "@/lib/api/session";
import {
  getOrCreatePreferences,
  serializePreferences,
  updatePreferences,
  type PreferencesPatch,
} from "@/lib/anaglyph/profiles";
import { isTextScaleStep, type TextScaleStep } from "@/lib/study/text-scale";

const textScaleSchema = z.custom<TextScaleStep>(isTextScaleStep);

const patchSchema = z
  .object({
    lazyEyeEnabled: z.boolean().optional(),
    wordTextScale: textScaleSchema.optional(),
    exampleTextScale: textScaleSchema.optional(),
    explanationTextScale: textScaleSchema.optional(),
    srsIntervalModifier: z.number().min(0.5).max(2).optional(),
    srsStartingEase: z.number().min(1.3).max(3).optional(),
    srsEasyBonus: z.number().min(1).max(2).optional(),
    srsHardInterval: z.number().min(0.5).max(1).optional(),
  })
  .refine(
    (value) =>
      value.lazyEyeEnabled !== undefined ||
      value.wordTextScale !== undefined ||
      value.exampleTextScale !== undefined ||
      value.explanationTextScale !== undefined ||
      value.srsIntervalModifier !== undefined ||
      value.srsStartingEase !== undefined ||
      value.srsEasyBonus !== undefined ||
      value.srsHardInterval !== undefined,
    { message: "At least one preference is required." },
  );

export async function GET(request: NextRequest) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const preferences = await getOrCreatePreferences(user.id);
  return NextResponse.json({
    preferences: serializePreferences(preferences),
  });
}

export async function PATCH(request: NextRequest) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = patchSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid preferences." }, { status: 400 });
  }
  const preferences = await updatePreferences(user.id, body.data as PreferencesPatch);
  return NextResponse.json({
    preferences: serializePreferences(preferences),
  });
}
