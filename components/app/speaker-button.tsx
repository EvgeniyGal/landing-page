"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import { requestAudioAction } from "@/app/app/actions";
import { cn } from "@/lib/utils";

export function SpeakerButton({
  flashcardId,
  kind,
  url,
  className,
}: {
  flashcardId: string;
  kind: "word" | "example_1" | "example_2" | "example_3";
  url?: string;
  className?: string;
}) {
  const [src, setSrc] = useState(url);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function play() {
    setError(null);
    let next = src;
    if (!next) {
      setBusy(true);
      const result = await requestAudioAction({ flashcardId, kind });
      setBusy(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      next = result.audio[kind];
      setSrc(next);
    }
    if (next) {
      const audio = new Audio(next);
      void audio.play();
    }
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => void play()}
        disabled={busy}
        className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
        aria-label="Play audio"
      >
        <Volume2 className="size-4" />
      </button>
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </span>
  );
}
