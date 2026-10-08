"use client";

import { HueDial } from "@/components/app/hue-dial";
import { hslToCss, type EyeSide } from "@/lib/anaglyph/color";

export function AnaglyphColorPicker({
  eye,
  leftHue,
  leftLightness,
  rightHue,
  rightLightness,
  onEyeChange,
  onHueChange,
  onLightnessChange,
}: {
  eye: EyeSide;
  leftHue: number;
  leftLightness: number;
  rightHue: number;
  rightLightness: number;
  onEyeChange: (eye: EyeSide) => void;
  onHueChange: (hue: number) => void;
  onLightnessChange: (lightness: number) => void;
}) {
  const hue = eye === "left" ? leftHue : rightHue;
  const lightness = eye === "left" ? leftLightness : rightLightness;
  const lightnessTrack = `linear-gradient(90deg, #000 0%, ${hslToCss(hue, 50)} 50%, #fff 100%)`;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["left", "right"] as const).map((side) => {
          const sideHue = side === "left" ? leftHue : rightHue;
          const sideLightness = side === "left" ? leftLightness : rightLightness;
          const selected = eye === side;
          return (
            <button
              key={side}
              type="button"
              onClick={() => onEyeChange(side)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
                selected ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]" : "opacity-85 hover:opacity-100"
              }`}
              style={{
                background: hslToCss(sideHue, sideLightness),
                color: "#111111",
              }}
            >
              {side} eye
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-wide text-white/45">Hue</span>
        <HueDial
          hue={hue}
          lightness={lightness}
          ariaLabel={`${eye} eye hue`}
          onChange={onHueChange}
        />
        <p className="text-center font-mono text-xs text-white/45">{hue.toFixed(1)}°</p>
      </div>

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
