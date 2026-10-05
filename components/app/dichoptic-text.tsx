import { dichopticLetters, dichopticSyllables } from "@/lib/anaglyph/render";
import type { AnaglyphColors } from "@/lib/anaglyph/color";

export function DichopticText({
  text,
  colors,
  mode,
  neutralColor,
  className,
}: {
  text: string;
  colors: AnaglyphColors;
  mode: "letters" | "syllables";
  neutralColor: string;
  className?: string;
}) {
  const segments = mode === "letters" ? dichopticLetters(text, colors) : dichopticSyllables(text, colors);
  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <span
          key={`${segment.text}-${index}`}
          style={{ color: segment.color ?? neutralColor }}
        >
          {segment.text}
        </span>
      ))}
    </span>
  );
}
