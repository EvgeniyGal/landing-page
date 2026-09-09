import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userFromApiRequest } from "@/lib/api/session";
import { AUDIO_KINDS, getOrCreateAudioBatch, parseAudioKind } from "@/lib/flashcard/audio";

const schema = z.object({
  kind: z.string(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = schema.safeParse(await request.json().catch(() => null));
  const kind = body.success ? parseAudioKind(body.data.kind) : null;
  if (!kind) {
    return NextResponse.json({ error: "Invalid audio kind." }, { status: 400 });
  }

  const kinds = kind === "all_examples" ? AUDIO_KINDS.filter((item) => item !== "word") : [kind];
  const items = await getOrCreateAudioBatch({
    userId: user.id,
    flashcardId: id,
    kinds,
  });

  const firstFailure = items.find((item) => !item.result.ok);
  if (firstFailure && !firstFailure.result.ok) {
    const status =
      firstFailure.result.reason === "tts_not_configured"
        ? 503
        : firstFailure.result.reason === "not_found"
          ? 404
          : 400;
    return NextResponse.json({ error: "Could not generate audio.", code: firstFailure.result.reason }, { status });
  }

  return NextResponse.json({
    audio: Object.fromEntries(
      items
        .filter((item) => item.result.ok)
        .map((item) => [item.kind, item.result.ok ? item.result.url : ""]),
    ),
  });
}
