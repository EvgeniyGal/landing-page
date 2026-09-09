import { NextResponse } from "next/server";
import { z } from "zod";
import { GoogleAuthError, linkOrActivateGoogleUser, verifyGoogleIdToken } from "@/lib/auth/google";
import { publicUser, signApiToken } from "@/lib/api/session";

const schema = z.object({
  idToken: z.string().min(1),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid Google token." }, { status: 400 });
  }

  try {
    const google = await verifyGoogleIdToken(body.data.idToken);
    const user = await linkOrActivateGoogleUser(google);
    const accessToken = await signApiToken(user);
    return NextResponse.json({ accessToken, user: publicUser(user) });
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      const status = error.code === "disabled" || error.code === "unknown_email" ? 403 : 401;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    return NextResponse.json({ error: "Invalid Google token." }, { status: 401 });
  }
}
