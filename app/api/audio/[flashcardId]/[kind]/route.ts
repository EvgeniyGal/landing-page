import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { userFromApiRequest } from "@/lib/api/session";
import { getDb } from "@/lib/db";
import { flashcardAudio, flashcards } from "@/lib/db/schema";
import { parseAudioKind } from "@/lib/flashcard/audio";
import { readAudioBlob } from "@/lib/storage/blob";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ flashcardId: string; kind: string }> },
) {
  const session = await auth();
  const apiUser = await userFromApiRequest(request);
  const userId = apiUser?.id ?? session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { flashcardId, kind: kindParam } = await context.params;
  const kind = parseAudioKind(kindParam);
  if (!kind || kind === "all_examples") {
    return NextResponse.json({ error: "Invalid audio kind." }, { status: 400 });
  }

  const db = getDb();
  const card = await db.query.flashcards.findFirst({
    where: and(eq(flashcards.id, flashcardId), eq(flashcards.userId, userId)),
  });
  if (!card) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const clip = await db.query.flashcardAudio.findFirst({
    where: and(eq(flashcardAudio.flashcardId, card.id), eq(flashcardAudio.kind, kind)),
  });
  if (!clip) {
    return NextResponse.json({ error: "Audio not found." }, { status: 404 });
  }

  try {
    const bytes = await readAudioBlob(clip.blobUrl);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": clip.contentType || "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not read audio." }, { status: 502 });
  }
}
