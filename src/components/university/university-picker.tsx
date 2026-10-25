"use client";

import { GraduationCap } from "lucide-react";
import { UNIVERSITIES } from "@/data/universities";
import { useUniversity } from "./university-provider";
import { cn } from "@/lib/cn";

/**
 * University selector. Adding a university to `data/universities.ts`
 * automatically adds it here — no UI changes required.
 */
export function UniversityPicker({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const { universityId, setUniversityId } = useUniversity();

  return (
    <div
      role="radiogroup"
      aria-label="Choose your university"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {UNIVERSITIES.map((university) => {
        const active = university.id === universityId;
        return (
          <button
            key={university.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setUniversityId(university.id)}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-xl border px-3.5 font-medium transition-all duration-150 active:scale-[0.98]",
              size === "md" ? "h-12 text-sm" : "h-10 text-xs",
              active
                ? "border-transparent bg-btn-primary-bg text-btn-primary-fg"
                : "border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex items-center justify-center rounded-lg font-display font-bold tracking-tight",
                size === "md" ? "size-7 text-[11px]" : "size-6 text-[10px]",
                active ? "bg-accent text-on-accent" : "bg-surface-2 text-muted",
              )}
            >
              {university.monogram}
            </span>
            {university.shortName}
          </button>
        );
      })}
    </div>
  );
}

/** Compact icon + label for tight spaces (e.g. filter toolbars). */
export function UniversityPickerLabel({ className }: { className?: string }) {
  const { university } = useUniversity();
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-medium text-ink", className)}>
      <GraduationCap className="size-4 text-muted" aria-hidden="true" />
      {university.shortName}
    </span>
  );
}
