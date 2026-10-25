"use client";

import { Check, Minus, Sparkles } from "lucide-react";
import { getProperty } from "@/data/properties";
import { UNIVERSITIES } from "@/data/universities";
import { priceForPeriod, sessionComparison } from "@/lib/pricing";
import { formatNaira } from "@/lib/format-currency";
import { SectionHeading } from "@/components/ui/section-heading";
import { DemoBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

/**
 * "One listing, two calendars" — the same cross-campus demo listing priced
 * simultaneously under the Nile (semester) and Baze (trimester) models.
 * Every number comes from the pricing engine; periods a listing doesn't
 * offer render as an explicit "not offered" row rather than a guessed price.
 */
export function PricingCalendarDemo() {
  // Cross-campus demo listing: carries both a semester and a trimester price.
  const property = getProperty("bze-jabi-annex");
  if (!property) return null;

  return (
    <section className="border-y border-line bg-surface">
      <div className="page-container py-16 lg:py-20">
        <SectionHeading
          eyebrow="Transparent pricing"
          title="One listing, two calendars"
          description="Rent in Abuja isn't quoted on one calendar. The same demo flat below is priced for a Nile student (semester-based) and a Baze student (trimester-based) at the same time — switch your university anywhere in the app and every price follows."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {UNIVERSITIES.map((university) => (
            <PricingColumn key={university.id} universityId={university.id} />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <DemoBadge />
          <p className="max-w-2xl text-right text-xs text-faint">
            Listing: {property.title} — fictional sample data. Session maths follows each
            university&apos;s demo model: session = {UNIVERSITIES[0].sessionPeriods.count}{" "}
            {UNIVERSITIES[0].sessionPeriods.basePeriod}s, session ={" "}
            {UNIVERSITIES[1].sessionPeriods.count} {UNIVERSITIES[1].sessionPeriods.basePeriod}s.
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingColumn({ universityId }: { universityId: string }) {
  const property = getProperty("bze-jabi-annex");
  const university = UNIVERSITIES.find((entry) => entry.id === universityId);
  if (!property || !university) return null;

  const comparison = sessionComparison(property, university);

  return (
    <div className="rounded-xl border border-line bg-canvas p-6">
      <div className="flex items-center gap-3">
        <span className="font-display inline-flex size-9 items-center justify-center rounded-lg bg-btn-primary-bg text-xs font-bold tracking-tight text-btn-primary-fg">
          {university.monogram}
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">{university.shortName}</h3>
          <p className="text-xs text-faint">
            {university.city} · demo rental model
          </p>
        </div>
      </div>

      <dl className="mt-5 divide-y divide-line border-t border-line">
        {university.rentalPeriods.map((option) => {
          const price = priceForPeriod(property, option.id, university);
          return (
            <div key={option.id} className="flex items-start justify-between gap-4 py-3.5">
              <dt className="text-sm">
                <span className="font-medium text-ink">{option.label}</span>
                <span className="mt-0.5 block text-xs text-faint">{option.note}</span>
              </dt>
              <dd className="text-right">
                {price ? (
                  <>
                    <span className="font-display block text-lg font-bold tracking-tight text-ink">
                      {formatNaira(price.amount)}
                    </span>
                    {price.derivation ? (
                      <span className="block text-[11px] leading-snug text-faint">
                        {price.basis === "derived" ? "Derived: " : "Listed: "}
                        {formatNaira(price.derivation.baseAmount)} × {price.derivation.periods}{" "}
                        {price.derivation.periodLabel}
                      </span>
                    ) : (
                      <span className="block text-[11px] text-faint">
                        {price.basis === "derived" ? "Derived from base period" : "Stated by landlord (demo)"}
                      </span>
                    )}
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
            Paying the full session is {formatNaira(comparison.saving)} cheaper than{" "}
            {formatNaira(comparison.derivedAmount)} ({formatNaira(comparison.derivedDerivation.baseAmount)}{" "}
            × {comparison.derivedDerivation.periods} {comparison.derivedDerivation.periodLabel}) in this
            demo listing.
          </span>
        </p>
      ) : (
        <p className={cn("mt-4 flex items-start gap-2 px-1 text-xs text-faint")}>
          <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          No session discount is modelled for this listing under {university.shortName} — the session
          price simply follows the university&apos;s demo formula.
        </p>
      )}
    </div>
  );
}
