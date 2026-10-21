import { NextRequest, NextResponse } from "next/server";
import { userFromApiRequest } from "@/lib/api/session";
import { serializeFlashcard } from "@/lib/api/serialize";
import { deleteDeckForUser } from "@/lib/flashcard/decks";
import {
  DEFAULT_DECK_CARD_PAGE_SIZE,
  DECK_CARD_PAGE_SIZES,
  getDeckDetail,
} from "@/lib/flashcard/queries";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("q")?.trim() || undefined;
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const paginate = pageParam != null || pageSizeParam != null || search != null;

  const pageSize = paginate
    ? (DECK_CARD_PAGE_SIZES as readonly number[]).includes(Number(pageSizeParam))
      ? Number(pageSizeParam)
      : DEFAULT_DECK_CARD_PAGE_SIZE
    : undefined;
  const page = paginate ? Math.max(1, Math.floor(Number(pageParam) || 1)) : undefined;

  const detail = await getDeckDetail(user.id, id, { search, page, pageSize });
  if (!detail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    deck: detail.deck,
    counts: detail.counts,
    cards: detail.cards.map((card) => serializeFlashcard(card)),
    ...(paginate
      ? {
          pagination: {
            page: detail.page,
            pageSize: detail.pageSize,
            total: detail.total,
            totalPages: detail.totalPages,
            search: detail.search,
          },
        }
      : {}),
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
  const result = await deleteDeckForUser({ userId: user.id, deckId: id });
  if (!result.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
