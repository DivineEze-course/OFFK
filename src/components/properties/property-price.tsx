"use client";

import { Info, Sparkles } from "lucide-react";
import type { Property } from "@/types/property";
import { priceForPeriod, sessionComparison } from "@/lib/pricing";
import { formatNaira } from "@/lib/format-currency";
import { useUniversity } from "@/components/university/university-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

/**
 * University-aware price display. Reads the globally selected university and
 * rental period, resolves the price through the pricing engine, and degrades
 * gracefully when a listing doesn't offer the selected period.
 */
export function PropertyPrice({
  property,
  size = "md",
  className,
}: {
  property: Property;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { university, period } = useUniversity();
  const price = priceForPeriod(property, period, university);
  const periodOption = university.rentalPeriods.find((option) => option.id === period);
  const comparison = period === "session" ? sessionComparison(property, university) : null;

  if (!price) {
    return (
      <div className={cn("rounded-lg border border-dashed border-line bg-surface-2 px-3 py-2", className)}>
        <p className="text-sm font-medium text-muted">
          No {periodOption?.shortLabel.toLowerCase() ?? "rental"} price listed
        </p>
        <p className="mt-0.5 text-xs text-faint">Other rental periods are shown on the listing page.</p>
      </div>
    );
  }

  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  }[size];

  return (
    <div className={cn("space-y-1", className)}>
      <p className="flex items-baseline gap-1.5">
        <span className={cn("font-display font-bold tracking-tight text-ink", sizeClasses)}>
          {formatNaira(price.amount)}
        </span>
        {periodOption ? (
          <span className="text-sm text-muted">
            / {periodOption.shortLabel.toLowerCase()}
          </span>
        ) : null}
      </p>

      {comparison ? (
        <Badge tone="accent">
          <Sparkles className="size-3" aria-hidden="true" />
          Save {formatNaira(comparison.saving)} paying for the session
        </Badge>
      ) : price.derivation ? (
        <p className="flex items-center gap-1 text-xs text-faint">
          <Info className="size-3 shrink-0" aria-hidden="true" />
          Derived: {formatNaira(price.derivation.baseAmount)} × {price.derivation.periods}{" "}
          {price.derivation.periodLabel}
        </p>
      ) : null}
    </div>
  );
}
