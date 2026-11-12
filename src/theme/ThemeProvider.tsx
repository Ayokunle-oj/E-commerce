import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  readStoredMode,
  storeMode,
  systemQuery,
  type ResolvedTheme,
  type ThemeMode,
} from "./theme";
import { ThemeContext, type ThemeContextValue } from "./themeContext";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [systemDark, setSystemDark] = useState(() => systemQuery().matches);

  // In automatic mode, follow the phone or computer when its setting changes
  useEffect(() => {
    const query = systemQuery();
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const theme: ResolvedTheme =
    mode === "system" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    storeMode(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, theme, setMode }),
    [mode, theme, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
