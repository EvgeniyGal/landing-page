import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userFromApiRequest } from "@/lib/api/session";
import {
  createAnaglyphProfile,
  ensureDefaultAnaglyphProfile,
  serializeAnaglyphProfile,
} from "@/lib/anaglyph/profiles";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  leftHue: z.number().min(0).max(360),
  leftLightness: z.number().min(0).max(100),
  rightHue: z.number().min(0).max(360),
  rightLightness: z.number().min(0).max(100),
  strongEye: z.enum(["left", "right"]).default("right"),
  strongEyeWeaken: z.number().min(0).max(100).default(0),
  background: z.enum(["black", "gray", "white"]),
});

export async function GET(request: NextRequest) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profiles = await ensureDefaultAnaglyphProfile(user.id);
  return NextResponse.json({
    profiles: profiles.map(serializeAnaglyphProfile),
  });
}

export async function POST(request: NextRequest) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = createSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid profile." }, { status: 400 });
  }
  const result = await createAnaglyphProfile(user.id, body.data);
  if (!result.ok) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  return NextResponse.json({ profile: serializeAnaglyphProfile(result.profile) }, { status: 201 });
}
