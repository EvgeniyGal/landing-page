export type ThemeMode = "light" | "dark" | "system";

export function systemPrefersDark() {
  const prefersDark = globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
  const prefersLight = globalThis.matchMedia("(prefers-color-scheme: light)").matches;
  return prefersDark || !prefersLight;
}

export function isDarkTheme(mode: ThemeMode | null) {
  if (mode === "light") {
    return false;
  }
  if (mode === "dark") {
    return true;
  }
  return systemPrefersDark();
}

export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var mode=localStorage.getItem("theme-mode");var prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;var prefersLight=window.matchMedia("(prefers-color-scheme: light)").matches;var systemDark=prefersDark||!prefersLight;var dark=mode==="light"?false:mode==="dark"?true:systemDark;document.documentElement.classList.toggle("dark",dark);}catch(e){document.documentElement.classList.add("dark");}})();`;
