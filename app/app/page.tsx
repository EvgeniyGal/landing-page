import { auth } from "@/auth";
import { DeckHome } from "@/components/app/deck-home";
import { getOrCreateDefaultDeck } from "@/lib/flashcard/decks";
import { listDecksForUser } from "@/lib/flashcard/queries";
import { redirect } from "next/navigation";

export default async function AppHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await getOrCreateDefaultDeck(session.user.id);
  const decks = await listDecksForUser(session.user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <DeckHome
        decks={decks.map((deck) => ({
          id: deck.id,
          name: deck.name,
          cardsDueToday: deck.cardsDueToday,
          cardCount: deck.cardCount,
        }))}
      />
    </div>
  );
}
