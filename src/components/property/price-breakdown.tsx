"use client";

import { Info, Minus, Sparkles } from "lucide-react";
import type { Property } from "@/types/property";
import { periodOptionsFor, sessionComparison } from "@/lib/pricing";
import { formatNaira } from "@/lib/format-currency";
import { useUniversity } from "@/components/university/university-provider";
import { DemoBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

/**
 * Full price breakdown for a listing across every rental period the selected
 * university offers. Periods the listing doesn't sell are rendered as an
 * explicit "not offered" row — the engine returns null and no number is
 * invented.
 */
export function PriceBreakdown({ property }: { property: Property }) {
  const { university, period } = useUniversity();
  const options = periodOptionsFor(property, university);
  const comparison = sessionComparison(property, university);
  const activeOption = options.find((option) => option.id === period);

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            Rent · {university.shortName}
          </p>
          <p className="mt-1 text-xs text-faint">
            {university.rentalPeriods.some((option) => option.id === period)
              ? `Showing the ${activeOption?.shortLabel.toLowerCase()} rate selected in the header.`
              : "The period selected in the header isn't offered here — all available periods are listed below."}
          </p>
        </div>
        <DemoBadge label="Demo price" />
      </div>

      <dl className="mt-4 divide-y divide-line border-t border-line">
        {options.map((option) => {
          const selected = option.id === period;
          return (
            <div
              key={option.id}
              className={cn("flex items-start justify-between gap-4 py-3.5", selected && "relative")}
            >
              <dt className="pr-2">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  {option.label}
                  {selected ? (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold tracking-wide text-on-accent uppercase">
                      Selected
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-xs text-faint">{option.note}</span>
              </dt>
              <dd className="text-right">
                {option.price ? (
                  <>
                    <span className="font-display block text-xl font-bold tracking-tight text-ink">
                      {formatNaira(option.price.amount)}
                    </span>
                    <span className="block text-[11px] leading-snug text-faint">
                      {option.price.derivation
                        ? `${option.price.basis === "derived" ? "Derived" : "Listed"}: ${formatNaira(
                            option.price.derivation.baseAmount,
                          )} × ${option.price.derivation.periods} ${option.price.derivation.periodLabel}`
                        : option.price.basis === "derived"
                          ? "Derived from the base period"
                          : "Stated by the landlord (demo)"}
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-muted">
                    <Minus className="size-3" aria-hidden="true" />
                    Not offered
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      {comparison ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-accent-strong/60 bg-accent/25 px-3 py-2.5 text-xs text-ink">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-on-accent" aria-hidden="true" />
          <span>
            Paying the full session up front saves {formatNaira(comparison.saving)} against{" "}
            {formatNaira(comparison.derivedAmount)} (
            {formatNaira(comparison.derivedDerivation.baseAmount)} ×{" "}
            {comparison.derivedDerivation.periods} {comparison.derivedDerivation.periodLabel}).
          </span>
        </p>
      ) : (
        <p className="mt-4 flex items-start gap-2 px-1 text-xs text-faint">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {university.sessionPeriods.explanation}
        </p>
      )}
    </div>
  );
}
