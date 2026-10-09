export type EyeSide = "left" | "right";

export type AnaglyphColors = {
  leftHue: number;
  leftLightness: number;
  rightHue: number;
  rightLightness: number;
};

export type AnaglyphBackgroundTone = "black" | "gray" | "white";

export type StrongEyeWeakenOptions = {
  strongEye: EyeSide;
  strongEyeWeaken: number;
  background: AnaglyphBackgroundTone;
};

export const ANAGLYPH_SATURATION = 100;

export function clampHue(hue: number) {
  const value = Number.isFinite(hue) ? hue % 360 : 0;
  return value < 0 ? value + 360 : value;
}

export function clampLightness(lightness: number) {
  return Math.min(100, Math.max(0, lightness));
}

export function clampWeaken(amount: number) {
  return Math.min(100, Math.max(0, Number.isFinite(amount) ? amount : 0));
}

export function normalizeEyeSide(value: unknown, fallback: EyeSide = "right"): EyeSide {
  return value === "left" || value === "right" ? value : fallback;
}

export function backgroundLightness(background: AnaglyphBackgroundTone) {
  if (background === "white") {
    return 96;
  }
  if (background === "gray") {
    return 42;
  }
  return 8;
}

export function resolveAnaglyphColors(
  colors: AnaglyphColors,
  options: StrongEyeWeakenOptions,
): AnaglyphColors {
  const amount = clampWeaken(options.strongEyeWeaken);
  if (amount === 0) {
    return {
      leftHue: colors.leftHue,
      leftLightness: colors.leftLightness,
      rightHue: colors.rightHue,
      rightLightness: colors.rightLightness,
    };
  }
  const bgL = backgroundLightness(options.background);
  const weakenL = (calibrated: number) =>
    clampLightness(calibrated + (bgL - calibrated) * (amount / 100));
  const strongEye = normalizeEyeSide(options.strongEye);
  if (strongEye === "left") {
    return {
      ...colors,
      leftLightness: weakenL(colors.leftLightness),
    };
  }
  return {
    ...colors,
    rightLightness: weakenL(colors.rightLightness),
  };
}

function hslToRgb(h: number, s: number, l: number) {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function hslToCss(hue: number, lightness: number, saturation = ANAGLYPH_SATURATION) {
  const { r, g, b } = hslToRgb(clampHue(hue), saturation, clampLightness(lightness));
  return `rgb(${r},${g},${b})`;
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
