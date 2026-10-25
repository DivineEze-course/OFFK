"use client";

import { useUniversity } from "@/components/university/university-provider";
import { cn } from "@/lib/cn";

/**
 * Rental period switcher. Options come from the selected university's data:
 * Nile shoppers see Semester / Session, Baze shoppers see Trimester / Session.
 */
export function PeriodToggle({ className }: { className?: string }) {
  const { university, period, setPeriod } = useUniversity();

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="radiogroup"
        aria-label="Rental period"
        className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface-2 p-1"
      >
        {university.rentalPeriods.map((option) => {
          const active = option.id === period;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPeriod(option.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:text-ink",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-faint">
        {university.rentalPeriods.find((option) => option.id === period)?.note}
      </p>
    </div>
  );
}
