import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userFromApiRequest } from "@/lib/api/session";
import { getOrCreatePreferences, setLazyEyeEnabled } from "@/lib/anaglyph/profiles";

const patchSchema = z.object({
  lazyEyeEnabled: z.boolean(),
});

export async function GET(request: NextRequest) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const preferences = await getOrCreatePreferences(user.id);
  return NextResponse.json({
    preferences: { lazyEyeEnabled: preferences.lazyEyeEnabled },
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
  const preferences = await setLazyEyeEnabled(user.id, body.data.lazyEyeEnabled);
  return NextResponse.json({
    preferences: { lazyEyeEnabled: preferences.lazyEyeEnabled },
  });
}
