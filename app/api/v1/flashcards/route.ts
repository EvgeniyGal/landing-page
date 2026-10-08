import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userFromApiRequest } from "@/lib/api/session";
import { serializeFlashcard } from "@/lib/api/serialize";
import {
  createFlashcardForUser,
  createFlashcardFromContentForUser,
  generateFlashcardPreviewForUser,
} from "@/lib/flashcard/create";
import { deleteFlashcardForUser } from "@/lib/flashcard/mutate";
import { generatedCardSchema } from "@/lib/flashcard/schema";

const previewSchema = z.object({
  inputText: z.string().trim().min(1).max(500),
  preview: z.literal(true),
});

const createFromContentSchema = z.object({
  inputText: z.string().trim().min(1).max(500),
  deckId: z.uuid().optional(),
  card: generatedCardSchema,
  replaceFlashcardId: z.uuid().optional(),
});

const legacyCreateSchema = z.object({
  inputText: z.string().trim().min(1).max(500),
  deckId: z.uuid().optional(),
  replaceFlashcardId: z.uuid().optional(),
});

export async function POST(request: NextRequest) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json().catch(() => null);

  const previewBody = previewSchema.safeParse(json);
  if (previewBody.success) {
    try {
      const result = await generateFlashcardPreviewForUser({ word: previewBody.data.inputText });
      if (!result.ok) {
        return NextResponse.json({ error: "Flashcard generation is not available." }, { status: 503 });
      }
      return NextResponse.json({ card: result.card, inputText: previewBody.data.inputText });
    } catch {
      return NextResponse.json({ error: "Could not generate a flashcard." }, { status: 502 });
    }
  }

  const fromContentBody = createFromContentSchema.safeParse(json);
  if (fromContentBody.success) {
    try {
      if (fromContentBody.data.replaceFlashcardId) {
        await deleteFlashcardForUser({
          userId: user.id,
          flashcardId: fromContentBody.data.replaceFlashcardId,
        });
      }
      const result = await createFlashcardFromContentForUser({
        userId: user.id,
        word: fromContentBody.data.inputText,
        deckId: fromContentBody.data.deckId,
        card: fromContentBody.data.card,
      });
      if (!result.ok) {
        const status = result.reason === "not_configured" ? 503 : 404;
        return NextResponse.json(
          {
            error:
              result.reason === "not_configured"
                ? "Flashcard generation is not available."
                : "Dictionary not found.",
          },
          { status },
        );
      }
      return NextResponse.json({ card: serializeFlashcard(result.flashcard) });
    } catch {
      return NextResponse.json({ error: "Could not save a flashcard." }, { status: 502 });
    }
  }

  const body = legacyCreateSchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: "Enter a word or phrase." }, { status: 400 });
  }

  try {
    if (body.data.replaceFlashcardId) {
      await deleteFlashcardForUser({
        userId: user.id,
        flashcardId: body.data.replaceFlashcardId,
      });
    }
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
