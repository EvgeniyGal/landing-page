import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AddCardForm } from "@/components/app/add-card-form";
import { Button } from "@/components/ui/button";
import { getDeckForUser } from "@/lib/flashcard/decks";

export default async function AddCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const { id } = await params;
  const deck = await getDeckForUser(session.user.id, id);
  if (!deck) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-6 text-sm text-white/40">
        <Link href="/app" className="hover:text-white">
          Home
        </Link>
        {" / "}
        <Link href={`/app/decks/${deck.id}`} className="hover:text-white">
          {deck.name}
        </Link>
        {" / Add new card"}
      </p>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Add new card</h1>
        <Button
          type="button"
          variant="outline"
          asChild
          className="border-white/15 bg-transparent text-white hover:bg-white/5"
        >
          <Link href={`/app/decks/${deck.id}`}>Back to deck</Link>
        </Button>
      </div>
      <AddCardForm deckId={deck.id} />
    </div>
  );
}
