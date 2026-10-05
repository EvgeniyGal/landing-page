"use client";

import { hslToCss, type EyeSide } from "@/lib/anaglyph/color";

export function AnaglyphColorPicker({
  eye,
  hue,
  lightness,
  onEyeChange,
  onHueChange,
  onLightnessChange,
}: {
  eye: EyeSide;
  hue: number;
  lightness: number;
  onEyeChange: (eye: EyeSide) => void;
  onHueChange: (hue: number) => void;
  onLightnessChange: (lightness: number) => void;
}) {
  const swatch = hslToCss(hue, lightness);
  const lightnessTrack = `linear-gradient(90deg, #000 0%, ${hslToCss(hue, 50)} 50%, #fff 100%)`;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["left", "right"] as const).map((side) => (
          <button
            key={side}
            type="button"
            onClick={() => onEyeChange(side)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
              eye === side ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            {side} eye
          </button>
        ))}
      </div>

      <div
        className="h-16 w-full rounded-2xl border border-white/15"
        style={{ background: swatch }}
        aria-hidden
      />

      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wide text-white/45">Hue</span>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={hue}
          onChange={(event) => onHueChange(Number(event.target.value))}
          className="anaglyph-hue-slider h-3 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
          }}
          aria-label={`${eye} eye hue`}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wide text-white/45">Brightness</span>
        <input
          type="range"
          min={8}
          max={92}
          step={1}
          value={lightness}
          onChange={(event) => onLightnessChange(Number(event.target.value))}
          className="h-3 w-full cursor-pointer appearance-none rounded-full"
          style={{ background: lightnessTrack }}
          aria-label={`${eye} eye brightness`}
        />
      </label>
    </div>
  );
}
