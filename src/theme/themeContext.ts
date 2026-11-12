import { createContext } from "react";
import type { ResolvedTheme, ThemeMode } from "./theme";

export interface ThemeContextValue {
  mode: ThemeMode; // what the user chose: light, dark or system
  theme: ResolvedTheme; // what is on screen right now
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
