import { NextRequest, NextResponse } from "next/server";
import { userFromApiRequest } from "@/lib/api/session";
import { serializeFlashcard } from "@/lib/api/serialize";
import { getDeckDetail } from "@/lib/flashcard/queries";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const detail = await getDeckDetail(user.id, id);
  if (!detail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    deck: detail.deck,
    counts: detail.counts,
    cards: detail.cards.map((card) => serializeFlashcard(card)),
  });
}
