import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudySession } from "@/components/app/study-session";
import { serializeFlashcard } from "@/lib/api/serialize";
import { getDueCards } from "@/lib/flashcard/queries";

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const { id } = await params;
  const queue = await getDueCards(session.user.id, id);
  if (!queue) {
    notFound();
  }

  return (
    <StudySession
      deckName={queue.deck.name}
      cards={queue.cards.map((card) => serializeFlashcard(card, { intervals: true }))}
    />
  );
}
