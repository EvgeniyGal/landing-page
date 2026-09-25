import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { EditCardForm } from "@/components/app/edit-card-form";
import { serializeFlashcard } from "@/lib/api/serialize";
import { getFlashcardForUser } from "@/lib/flashcard/mutate";
import { getDeckForUser } from "@/lib/flashcard/decks";
import { stripDuplicatePosPrefix } from "@/lib/flashcard/format";

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string; cardId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const { id: deckId, cardId } = await params;
  const deck = await getDeckForUser(session.user.id, deckId);
  if (!deck) {
    notFound();
  }
  const card = await getFlashcardForUser(session.user.id, cardId);
  if (!card || card.deckId !== deck.id) {
    notFound();
  }

  const serialized = serializeFlashcard(card);
  const initialCard = {
    id: serialized.id,
    word: serialized.word,
    partOfSpeech: serialized.partOfSpeech,
    transcription: serialized.transcription,
    irregularForms: serialized.irregularForms,
    examples: serialized.examples.length === 3 ? serialized.examples : [
      serialized.examples[0] ?? "",
      serialized.examples[1] ?? "",
      serialized.examples[2] ?? "",
    ],
    definition: stripDuplicatePosPrefix(card.definition ?? serialized.definition, card.partOfSpeech),
    audio: serialized.audio,
  };

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
        {" / Edit card"}
      </p>
      <h1 className="mb-6 text-3xl font-semibold">Edit card</h1>
      <EditCardForm deckId={deck.id} deckName={deck.name} initialCard={initialCard} />
    </div>
  );
}
