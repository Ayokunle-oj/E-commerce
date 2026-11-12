export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "fimba-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

export function readStoredMode(): ThemeMode {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system"
      ? value
      : "system";
  } catch {
    return "system";
  }
}

export function storeMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* storage can be blocked; the choice just lasts until the page closes */
  }
}

export const systemQuery = () => window.matchMedia(DARK_QUERY);

export function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);

  // Keep the phone's browser bar in step with the page
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  const background = getComputedStyle(root).getPropertyValue("--background").trim();
  if (background) meta.content = background;
}
