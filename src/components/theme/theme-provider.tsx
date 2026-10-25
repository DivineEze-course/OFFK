"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { createStoredValue, useStoredValue } from "@/lib/stored-value";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  /** `false` until storage has been read (server + hydration render). */
  ready: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Backed by localStorage and read through `useSyncExternalStore`, so the
 * server snapshot is deterministic (no hydration mismatch) and there is no
 * setState-in-effect cascade on mount.
 */
const themeStore = createStoredValue<Theme>({
  key: "offk.theme",
  fallback: "light",
  parse: (raw) => {
    if (raw === "light" || raw === "dark") return raw;
    // Match the pre-paint inline script in app/layout.tsx exactly.
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },
  serialize: (value) => value,
});

/**
 * Applies the theme to <html>. The initial value is set before hydration by
 * the inline script in app/layout.tsx, so there is no flash of the wrong
 * theme; this effect keeps it in sync from then on (including across tabs).
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useStoredValue(themeStore);
  const { value: theme, ready } = snapshot;

  // Syncing an external system (the document) is exactly what effects are for.
  useEffect(() => {
    if (ready) applyTheme(theme);
  }, [theme, ready]);

  const setTheme = useCallback((next: Theme) => {
    themeStore.write(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = themeStore.getSnapshot().value;
    themeStore.write(current === "dark" ? "light" : "dark");
  }, []);

  const value = useMemo(
    () => ({ theme, ready, setTheme, toggleTheme }),
    [theme, ready, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
