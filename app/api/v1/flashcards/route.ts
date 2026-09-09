import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userFromApiRequest } from "@/lib/api/session";
import { serializeFlashcard } from "@/lib/api/serialize";
import { createFlashcardForUser } from "@/lib/flashcard/create";

const schema = z.object({
  inputText: z.string().trim().min(1).max(500),
  deckId: z.uuid().optional(),
});

export async function POST(request: NextRequest) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Enter a word or phrase." }, { status: 400 });
  }

  try {
    const result = await createFlashcardForUser({
      userId: user.id,
      word: body.data.inputText,
      deckId: body.data.deckId,
    });
    if (!result.ok) {
      const status = result.reason === "not_configured" ? 503 : 404;
      return NextResponse.json({ error: "Flashcard generation is not available." }, { status });
    }
    return NextResponse.json({ card: serializeFlashcard(result.flashcard) });
  } catch {
    return NextResponse.json({ error: "Could not generate a flashcard." }, { status: 502 });
  }
}
