import assert from "node:assert/strict";
import { test } from "node:test";
import { isDarkTheme } from "../lib/theme";

function mockColorScheme(scheme: "dark" | "light" | "no-preference") {
  globalThis.matchMedia = ((query: string) => ({
    matches:
      query.includes("prefers-color-scheme: dark")
        ? scheme === "dark"
        : query.includes("prefers-color-scheme: light")
          ? scheme === "light"
          : false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  })) as typeof window.matchMedia;
}

test("isDarkTheme follows an explicit OS dark preference", () => {
  mockColorScheme("dark");
  assert.equal(isDarkTheme("system"), true);
  assert.equal(isDarkTheme(null), true);
});

test("isDarkTheme follows an explicit OS light preference", () => {
  mockColorScheme("light");
  assert.equal(isDarkTheme("system"), false);
  assert.equal(isDarkTheme(null), false);
});

test("isDarkTheme defaults to dark when the OS has no preference", () => {
  mockColorScheme("no-preference");
  assert.equal(isDarkTheme("system"), true);
  assert.equal(isDarkTheme(null), true);
});

test("isDarkTheme honors an explicit Light or Dark override", () => {
  mockColorScheme("light");
  assert.equal(isDarkTheme("dark"), true);
  mockColorScheme("dark");
  assert.equal(isDarkTheme("light"), false);
});
