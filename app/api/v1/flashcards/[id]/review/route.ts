import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userFromApiRequest } from "@/lib/api/session";
import { serializeFlashcard } from "@/lib/api/serialize";
import { reviewCard } from "@/lib/srs/review";

const schema = z.object({
  rating: z.enum(["again", "hard", "good", "easy"]),
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
  if (!body.success) {
    return NextResponse.json({ error: "Invalid rating." }, { status: 400 });
  }

  const result = await reviewCard({
    userId: user.id,
    flashcardId: id,
    rating: body.data.rating,
  });
  if (!result.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ card: serializeFlashcard(result.card) });
}
