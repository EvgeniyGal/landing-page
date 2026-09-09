import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { SpeakerButton } from "@/components/app/speaker-button";
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

      <ul className="overflow-hidden rounded-2xl bg-[#1a1a1a]">
        {detail.cards.map((card, index) => {
          const payload = cardPayload(card);
          const status = statusLabel(card.state);
          const audio = Object.fromEntries(
            card.audio.map((item) => [item.kind, audioPlaybackPath(card.id, item.kind)]),
          );
          return (
            <li key={card.id} className={index > 0 ? "border-t border-white/8" : undefined}>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {payload?.irregularForms || payload?.word || card.inputText}
                  </p>
                  <p className="truncate text-sm text-white/45">
                    {payload
                      ? formatBackDefinition(payload.definition, payload.partOfSpeech)
                      : card.outputText.slice(0, 80)}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs ${status.className}`}>{status.label}</span>
                {audio.word ? (
                  <SpeakerButton flashcardId={card.id} kind="word" url={audio.word} generateOnPlay={false} />
                ) : null}
              </div>
            </li>
          );
        })}
        {detail.cards.length === 0 ? (
          <li className="px-5 py-10 text-sm text-white/45">No cards in this deck yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
