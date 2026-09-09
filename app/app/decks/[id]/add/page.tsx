import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AddCardForm } from "@/components/app/add-card-form";
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
      <h1 className="mb-6 text-3xl font-semibold">Add new card</h1>
      <AddCardForm deckId={deck.id} />
    </div>
  );
}
