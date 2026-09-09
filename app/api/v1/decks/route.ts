import { NextRequest, NextResponse } from "next/server";
import { userFromApiRequest } from "@/lib/api/session";
import { listDecksForUser } from "@/lib/flashcard/queries";

export async function GET(request: NextRequest) {
  const user = await userFromApiRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const decks = await listDecksForUser(user.id);
  return NextResponse.json({ decks });
}
