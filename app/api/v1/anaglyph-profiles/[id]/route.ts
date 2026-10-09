import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userFromApiRequest } from "@/lib/api/session";
import {
  deleteAnaglyphProfile,
  serializeAnaglyphProfile,
  updateAnaglyphProfile,
} from "@/lib/anaglyph/profiles";

const patchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  leftHue: z.number().min(0).max(360).optional(),
  leftLightness: z.number().min(0).max(100).optional(),
  rightHue: z.number().min(0).max(360).optional(),
  rightLightness: z.number().min(0).max(100).optional(),
  strongEye: z.enum(["left", "right"]).optional(),
  strongEyeWeaken: z.number().min(0).max(100).optional(),
  background: z.enum(["black", "gray", "white"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = patchSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid profile." }, { status: 400 });
  }
  const result = await updateAnaglyphProfile(user.id, id, body.data);
  if (!result.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ profile: serializeAnaglyphProfile(result.profile) });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await userFromApiRequest(_request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const result = await deleteAnaglyphProfile(user.id, id);
  if (!result.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
