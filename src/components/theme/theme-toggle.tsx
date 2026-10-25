"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/cn";

/**
 * Light/dark toggle. Renders a neutral icon until the stored theme has been
 * read on the client, which keeps server markup and hydration identical.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, ready, toggleTheme } = useTheme();
  const isDark = ready && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ready ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle colour theme"}
      title={ready ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-lg border border-transparent text-ink transition-colors hover:border-line hover:bg-surface-2",
        className,
      )}
    >
      {!ready ? (
        <SunMoon className="size-[18px]" aria-hidden="true" />
      ) : isDark ? (
        <Sun className="size-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="size-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
