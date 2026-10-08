"use client";

import { useCallback, useRef } from "react";
import { clampHue, hslToCss } from "@/lib/anaglyph/color";

const DIAL_SIZE = 176;
const RING_WIDTH = 22;

function snapHue(value: number) {
  return Math.round(clampHue(value) * 2) / 2;
}

function angleFromPointer(clientX: number, clientY: number, rect: DOMRect) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  // 0° at top, clockwise — matches CSS conic-gradient(from 0deg).
  const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return clampHue(degrees);
}

export function HueDial({
  hue,
  lightness,
  ariaLabel,
  onChange,
}: {
  hue: number;
  lightness: number;
  ariaLabel: string;
  onChange: (hue: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const applyPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = rootRef.current;
      if (!el) {
        return;
      }
      onChange(snapHue(angleFromPointer(clientX, clientY, el.getBoundingClientRect())));
    },
    [onChange],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    applyPointer(event.clientX, event.clientY);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) {
      return;
    }
    applyPointer(event.clientX, event.clientY);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(snapHue(hue - 0.5));
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(snapHue(hue + 0.5));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      onChange(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      onChange(359.5);
    }
  };

  const center = hslToCss(hue, lightness);
  const thumbColor = hslToCss(hue, 50);

  return (
    <div
      ref={rootRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={hue}
      aria-valuetext={`${hue} degrees`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className="relative mx-auto touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]/60"
      style={{ width: DIAL_SIZE, height: DIAL_SIZE }}
    >
      <div
        className="absolute inset-0 rounded-full border border-white/15"
        style={{
          background:
            "conic-gradient(from 0deg, #f00 0deg, #ff0 60deg, #0f0 120deg, #0ff 180deg, #00f 240deg, #f0f 300deg, #f00 360deg)",
        }}
        aria-hidden
      />
      <div
        className="absolute rounded-full border border-black/40"
        style={{
          inset: RING_WIDTH,
          background: center,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ transform: `rotate(${clampHue(hue)}deg)` }}
        aria-hidden
      >
        <span
          className="absolute left-1/2 rounded-full border-2 border-white"
          style={{
            width: 18,
            height: 18,
            marginLeft: -9,
            top: (RING_WIDTH - 18) / 2,
            background: thumbColor,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.35)",
          }}
        />
      </div>
    </div>
  );
}
