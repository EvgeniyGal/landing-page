import { NextRequest, NextResponse } from "next/server";
import { userFromApiRequest } from "@/lib/api/session";
import { serializeFlashcard } from "@/lib/api/serialize";
import {
  deleteFlashcardForUser,
  getFlashcardForUser,
  updateFlashcardForUser,
} from "@/lib/flashcard/mutate";
import { generatedCardSchema } from "@/lib/flashcard/schema";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const card = await getFlashcardForUser(user.id, id);
  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ card: serializeFlashcard(card) });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = generatedCardSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid flashcard payload." }, { status: 400 });
  }

  const result = await updateFlashcardForUser({
    userId: user.id,
    flashcardId: id,
    data: body.data,
  });
  if (!result.ok) {
    const status = result.reason === "not_found" ? 404 : 400;
    return NextResponse.json(
      { error: result.reason === "not_found" ? "Not found" : "Invalid flashcard payload." },
      { status },
    );
  }
  return NextResponse.json({ card: serializeFlashcard(result.flashcard) });
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
  const result = await deleteFlashcardForUser({ userId: user.id, flashcardId: id });
  if (!result.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
