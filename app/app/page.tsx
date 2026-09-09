import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { auth } from "@/auth";
import { getOrCreateDefaultDeck } from "@/lib/flashcard/decks";
import { listDecksForUser } from "@/lib/flashcard/queries";
import { redirect } from "next/navigation";

export default async function AppHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const defaultDeck = await getOrCreateDefaultDeck(session.user.id);
  const decks = await listDecksForUser(session.user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">Home</h1>
        <Link
          href={`/app/decks/${defaultDeck.id}/add`}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3d8bff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f7af0]"
        >
          <Plus className="size-4" />
          Add manually
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#1a1a1a]">
        {decks.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/50">No decks yet. Add a card to create your English deck.</p>
        ) : (
          <ul>
            {decks.map((deck, index) => (
              <li key={deck.id} className={index > 0 ? "border-t border-white/8" : undefined}>
                <Link
                  href={`/app/decks/${deck.id}`}
                  className="flex items-center justify-between px-5 py-5 hover:bg-white/4"
                >
                  <div>
                    <p className="text-lg font-medium">{deck.name}</p>
                    <p className="mt-1 text-sm text-white/45">Cards for today: {deck.cardsDueToday}</p>
                  </div>
                  <ChevronRight className="size-5 text-white/35" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
