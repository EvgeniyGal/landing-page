import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userFromApiRequest } from "@/lib/api/session";
import {
  AUDIO_KINDS,
  audioPlaybackPath,
  deleteFlashcardAudio,
  getOrCreateAudioBatch,
  parseAudioKind,
} from "@/lib/flashcard/audio";
import type { AudioKind } from "@/lib/db/schema";

const mutateSchema = z.object({
  kind: z.string(),
  force: z.boolean().optional(),
});

function resolveKinds(kindValue: string): AudioKind[] | null {
  const kind = parseAudioKind(kindValue);
  if (!kind) {
    return null;
  }
  return kind === "all_examples" ? AUDIO_KINDS.filter((item) => item !== "word") : [kind];
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = mutateSchema.safeParse(await request.json().catch(() => null));
  const kinds = body.success ? resolveKinds(body.data.kind) : null;
  if (!kinds) {
    return NextResponse.json({ error: "Invalid audio kind." }, { status: 400 });
  }

  const items = await getOrCreateAudioBatch({
    userId: user.id,
    flashcardId: id,
    kinds,
    force: body.success ? body.data.force : false,
  });

  const firstFailure = items.find((item) => !item.result.ok);
  if (firstFailure && !firstFailure.result.ok) {
    const status =
      firstFailure.result.reason === "tts_not_configured" || firstFailure.result.reason === "voice_restricted"
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
        .map((item) => [item.kind, item.result.ok ? audioPlaybackPath(id, item.kind) : ""]),
    ),
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = mutateSchema.safeParse(await request.json().catch(() => null));
  const kinds = body.success ? resolveKinds(body.data.kind) : null;
  if (!kinds) {
    return NextResponse.json({ error: "Invalid audio kind." }, { status: 400 });
  }

  const result = await deleteFlashcardAudio({
    userId: user.id,
    flashcardId: id,
    kinds,
  });
  if (!result.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, removed: kinds });
}
