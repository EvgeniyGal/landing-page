"use client";

import { eyeColor, type AnaglyphColors } from "@/lib/anaglyph/color";

export function DichopticRatingButton({
  label,
  interval,
  colors,
  invert = false,
  disabled,
  onClick,
}: {
  label: string;
  interval?: string;
  colors: AnaglyphColors;
  /** When true, swap which eye color is background vs text. */
  invert?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const left = eyeColor(colors, "left");
  const right = eyeColor(colors, "right");
  const background = invert ? right : left;
  const foreground = invert ? left : right;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl px-3 py-4 text-center disabled:opacity-55"
      style={{ background }}
    >
      <span className="block text-2xl font-bold leading-tight" style={{ color: foreground }}>
        {label}
      </span>
      {interval ? (
        <span className="mt-1 block text-base font-semibold opacity-90" style={{ color: foreground }}>
          {interval}
        </span>
      ) : null}
    </button>
  );
}
