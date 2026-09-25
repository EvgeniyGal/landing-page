import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userFromApiRequest } from "@/lib/api/session";
import { createDeckForUser } from "@/lib/flashcard/decks";
import { listDecksForUser } from "@/lib/flashcard/queries";

const createSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export async function GET(request: NextRequest) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const decks = await listDecksForUser(user.id);
  return NextResponse.json({ decks });
}

export async function POST(request: NextRequest) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = createSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Enter a dictionary name." }, { status: 400 });
  }
  const result = await createDeckForUser({ userId: user.id, name: body.data.name });
  if (!result.ok) {
    return NextResponse.json({ error: "Enter a dictionary name." }, { status: 400 });
  }
  return NextResponse.json({ deck: result.deck });
}
