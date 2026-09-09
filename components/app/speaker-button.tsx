"use client";

import { CheckCircle2, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { requestAudioAction } from "@/app/app/actions";
import { cn } from "@/lib/utils";

export function GeneratedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-emerald-300",
        className,
      )}
    >
      <CheckCircle2 className="size-3.5" />
      Generated
    </span>
  );
}

export function SpeakerButton({
  flashcardId,
  kind,
  url,
  generateOnPlay = false,
  className,
}: {
  flashcardId: string;
  kind: "word" | "example_1" | "example_2" | "example_3";
  url?: string;
  generateOnPlay?: boolean;
  className?: string;
}) {
  const [src, setSrc] = useState(url);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSrc(url);
  }, [url]);

  async function play() {
    setError(null);
    let next = src;
    if (!next) {
      if (!generateOnPlay) {
        return;
      }
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
        disabled={busy || (!src && !generateOnPlay)}
        className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
        aria-label="Play audio"
      >
        <Volume2 className="size-4" />
      </button>
      {error ? <span className="max-w-56 text-xs leading-snug text-red-300">{error}</span> : null}
    </span>
  );
}
