import { NextRequest, NextResponse } from "next/server";
import { userFromApiRequest } from "@/lib/api/session";
import { serializeFlashcard } from "@/lib/api/serialize";
import { getDueCards } from "@/lib/flashcard/queries";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const queue = await getDueCards(user.id, id);
  if (!queue) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    deck: queue.deck,
    cards: queue.cards.map((card) => serializeFlashcard(card, { intervals: true })),
  });
}
