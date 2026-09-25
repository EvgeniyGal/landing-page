import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { DeckCardList, type DeckCardItem } from "@/components/app/deck-card-list";
import { getDeckDetail } from "@/lib/flashcard/queries";
import { audioPlaybackPath } from "@/lib/flashcard/audio";
import { cardPayload } from "@/lib/flashcard/create";
import { formatBackDefinition } from "@/lib/flashcard/format";

function statusLabel(state: string) {
  if (state === "new") {
    return { label: "New", className: "bg-sky-500/20 text-sky-200" };
  }
  if (state === "review") {
    return { label: "Review", className: "bg-white/10 text-white/70" };
  }
  return { label: "Learning", className: "bg-emerald-500/20 text-emerald-200" };
}

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const { id } = await params;
  const detail = await getDeckDetail(session.user.id, id);
  if (!detail) {
    notFound();
  }

  const cards: DeckCardItem[] = detail.cards.map((card) => {
    const payload = cardPayload(card);
    const status = statusLabel(card.state);
    const audio = Object.fromEntries(
      card.audio.map((item) => [item.kind, audioPlaybackPath(card.id, item.kind)]),
    );
    return {
      id: card.id,
      word: payload?.word || card.word || card.inputText,
      partOfSpeech: payload?.partOfSpeech ?? card.partOfSpeech,
      transcription: payload?.transcription ?? card.transcription,
      irregularForms: payload?.irregularForms ?? card.irregularForms,
      examples: payload?.examples ?? card.examples ?? ["", "", ""],
      definition: payload
        ? formatBackDefinition(payload.definition, payload.partOfSpeech)
        : card.outputText.slice(0, 80),
      stateLabel: status.label,
      stateClassName: status.className,
      audioWordUrl: audio.word,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="mb-2 text-sm text-white/40">
        <Link href="/app" className="hover:text-white">
          Home
        </Link>
        <span> / {detail.deck.name}</span>
      </p>
      <h1 className="mb-6 text-3xl font-semibold">{detail.deck.name}</h1>

      <div className="mb-6 rounded-2xl bg-[#1a1a1a] p-6">
        <p className="text-5xl font-semibold">{detail.counts.due}</p>
        <p className="mt-1 text-sm text-white/45">cards due today</p>
        <div className="mt-4 flex gap-6 text-sm text-white/60">
          <span>New {detail.counts.new}</span>
          <span>Learning {detail.counts.learning}</span>
          <span>Review {detail.counts.review}</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/app/decks/${id}/study`}
            className="inline-flex rounded-xl bg-[#3d8bff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2f7af0]"
          >
            Start now
          </Link>
          <Link
            href={`/app/decks/${id}/add`}
            className="inline-flex rounded-xl border border-white/15 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
          >
            Add card
          </Link>
        </div>
      </div>

      <DeckCardList deckId={id} cards={cards} />
    </div>
  );
}
