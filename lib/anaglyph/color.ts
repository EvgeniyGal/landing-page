export type EyeSide = "left" | "right";

export type AnaglyphColors = {
  leftHue: number;
  leftLightness: number;
  rightHue: number;
  rightLightness: number;
};

export const ANAGLYPH_SATURATION = 100;

export function clampHue(hue: number) {
  const value = Number.isFinite(hue) ? hue % 360 : 0;
  return value < 0 ? value + 360 : value;
}

export function clampLightness(lightness: number) {
  return Math.min(100, Math.max(0, lightness));
}

export function hslToCss(hue: number, lightness: number, saturation = ANAGLYPH_SATURATION) {
  return `hsl(${clampHue(hue)} ${saturation}% ${clampLightness(lightness)}%)`;
}

export function eyeColor(colors: AnaglyphColors, eye: EyeSide) {
  if (eye === "left") {
    return hslToCss(colors.leftHue, colors.leftLightness);
  }
  return hslToCss(colors.rightHue, colors.rightLightness);
}

export function contrastTextForLightness(lightness: number) {
  return lightness >= 55 ? "#111111" : "#f5f5f5";
}

export function backgroundCss(background: "black" | "gray" | "white") {
  if (background === "white") {
    return "#f4f4f4";
  }
  if (background === "gray") {
    return "#6b6b6b";
  }
  return "#0c0c0c";
}

export function neutralForeground(background: "black" | "gray" | "white") {
  if (background === "white") {
    return "#1a1a1a";
  }
  if (background === "gray") {
    return "#f0f0f0";
  }
  return "rgba(255,255,255,0.88)";
}
