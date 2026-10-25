"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, School } from "lucide-react";
import { UNIVERSITIES } from "@/data/universities";
import { PROPERTIES, propertiesForUniversity } from "@/data/properties";
import { priceForPeriod } from "@/lib/pricing";
import { useUniversity } from "@/components/university/university-provider";
import { UniversityPicker } from "./university-picker";
import { PeriodToggle } from "@/components/search/period-toggle";
import { DemoBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

/**
 * Universities page: the pricing-rule explainer. Each card shows the school's
 * rental calendar, the derived session formula and a live "cheapest listing"
 * figure taken straight from the pricing engine.
 */
export function UniversitiesPageClient() {
  const { university, period } = useUniversity();

  return (
    <div className="page-container py-10 lg:py-14">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Universities</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Pricing that speaks your school&apos;s language
        </h1>
        <p className="mt-4 text-base text-muted">
          Different universities run different academic calendars, so rent should not be quoted on
          one generic timeline. OFFK stores each university&apos;s rental model as data — add a
          school and every price, period and label follows without touching the UI.
        </p>
        <div className="mt-5">
          <DemoBadge label="Demo pricing models" />
        </div>
      </header>

      <section aria-label="Choose your university" className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="text-sm font-medium text-ink">I study at</p>
        <div className="mt-3">
          <UniversityPicker />
        </div>
        <div className="mt-5 border-t border-line pt-5">
          <p className="mb-3 text-sm font-medium text-ink">I pay rent</p>
          <PeriodToggle />
        </div>
      </section>

      <div className="mt-10 space-y-8">
        {UNIVERSITIES.map((entry) => {
          const listings = propertiesForUniversity(entry.id);
          const active = entry.id === university.id;

          // Cheapest live quote for the currently selected period, if any.
          const cheapest = listings
            .map((listing) => priceForPeriod(listing, period, entry))
            .filter((price) => price != null)
            .sort((a, b) => (a?.amount ?? 0) - (b?.amount ?? 0))[0];
          const periodLabel =
            entry.rentalPeriods.find((option) => option.id === period)?.shortLabel.toLowerCase() ??
            "period";

          return (
            <article
              key={entry.id}
              className={
                active
                  ? "overflow-hidden rounded-2xl border-2 border-btn-primary-bg bg-surface"
                  : "overflow-hidden rounded-2xl border border-line bg-surface"
              }
            >
              <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                <div className="relative aspect-16/9 lg:aspect-auto lg:min-h-64">
                  <Image
                    src={entry.image.src}
                    alt={entry.image.alt}
                    fill
                    sizes="(min-width: 1024px) 55vw, 94vw"
                    className="object-cover"
                  />
                  <span
                    className={
                      active
                        ? "absolute top-4 left-4 rounded-full bg-btn-primary-bg px-3 py-1 text-xs font-semibold text-btn-primary-fg"
                        : "absolute top-4 left-4 rounded-full bg-canvas/95 px-3 py-1 text-xs font-semibold text-ink"
                    }
                  >
                    {active ? "Currently selected" : `Select ${entry.shortName}`}
                  </span>
                </div>

                <div className="p-6 lg:pr-8 lg:py-7">
                  <div className="flex items-start gap-3">
                    <span className="font-display inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-on-accent">
                      {entry.monogram}
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-semibold text-ink">{entry.name}</h2>
                      <p className="text-sm text-muted">
                        {entry.city}, {entry.state} · {listings.length} sample listing
                        {listings.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted">{entry.about}</p>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-xl border border-line bg-canvas p-4">
                      <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        Rental periods
                      </p>
                      <ul className="mt-2.5 space-y-1.5">
                        {entry.rentalPeriods.map((option) => (
                          <li key={option.id} className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="font-medium text-ink">{option.label}</span>
                            <span className="text-right text-xs text-faint">{option.note}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
                        {entry.sessionPeriods.explanation}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-muted">
                        {cheapest ? (
                          <>
                            Cheapest {periodLabel} quote:{" "}
                            <span className="font-display font-bold text-ink">
                              ₦{cheapest.amount.toLocaleString("en-NG")}
                            </span>
                          </>
                        ) : (
                          <>No {periodLabel} quotes in the demo set.</>
                        )}
                      </p>
                      <Link
                        href={`/properties?university=${entry.id}&period=${entry.rentalPeriods[0].id}`}
                        className={buttonClasses("outline", "sm")}
                      >
                        Browse {entry.shortName}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-line px-6 py-4">
                <MapPin className="size-3.5 text-faint" aria-hidden="true" />
                <span className="text-xs text-faint">Demo areas:</span>
                {entry.areas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-xs text-muted"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-10 rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display flex items-center gap-2 text-xl font-semibold text-ink">
          <School className="size-5 text-muted" aria-hidden="true" />
          Adding a university
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          Universities live in a single data file. Append an object with its name, areas,
          coordinate note, rental periods and session formula — the picker, filters, price panels,
          map and search results all pick it up automatically. The dataset currently holds{" "}
          {UNIVERSITIES.length} universities and {PROPERTIES.length} demo listings.
        </p>
      </section>
    </div>
  );
}
