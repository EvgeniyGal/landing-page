"use client";

import { DichopticText } from "@/components/app/dichoptic-text";
import {
  contrastTextForLightness,
  eyeColor,
  type AnaglyphColors,
} from "@/lib/anaglyph/color";

export function DichopticRatingButton({
  label,
  interval,
  colors,
  disabled,
  onClick,
}: {
  label: string;
  interval?: string;
  colors: AnaglyphColors;
  disabled?: boolean;
  onClick: () => void;
}) {
  const left = eyeColor(colors, "left");
  const right = eyeColor(colors, "right");
  const labelColor = contrastTextForLightness(
    (colors.leftLightness + colors.rightLightness) / 2,
  );

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="relative overflow-hidden rounded-xl px-3 py-3 text-center disabled:opacity-55"
    >
      <span
        className="anaglyph-pulse-left absolute inset-y-0 left-0 w-1/2"
        style={{ background: left }}
        aria-hidden
      />
      <span
        className="anaglyph-pulse-right absolute inset-y-0 right-0 w-1/2"
        style={{ background: right }}
        aria-hidden
      />
      <span className="relative block text-sm font-semibold" style={{ color: labelColor }}>
        <DichopticText text={label} colors={colors} mode="letters" neutralColor={labelColor} />
      </span>
      {interval ? (
        <span className="relative block text-xs opacity-80" style={{ color: labelColor }}>
          {interval}
        </span>
      ) : null}
    </button>
  );
}
