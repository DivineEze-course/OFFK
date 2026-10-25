"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { PROPERTIES } from "@/data/properties";
import { matchesUniversityAndPeriod } from "@/lib/filters";
import { useUniversity } from "@/components/university/university-provider";
import { PropertyGrid } from "@/components/properties/property-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonClasses } from "@/components/ui/button";

const FEATURED_LIMIT = 6;

/**
 * Featured sample listings for the currently selected university + rental
 * period. Switching the university in the header re-quotes this whole section.
 */
export function FeaturedStays() {
  const { university, period, ready } = useUniversity();

  const featured = PROPERTIES.filter((property) =>
    matchesUniversityAndPeriod(property, university, period),
  ).slice(0, FEATURED_LIMIT);

  return (
    <section className="page-container py-16 lg:py-20">
      <SectionHeading
        eyebrow="Featured stays"
        title={`Sample accommodation near ${university.shortName}`}
        description={`Picked from the demo dataset for the ${university.shortName} area and quoted per ${
          university.rentalPeriods.find((option) => option.id === period)?.shortLabel.toLowerCase() ??
          "period"
        }. Every card below is fictional sample data.`}
        action={{ label: "See all listings", href: "/properties" }}
      />

      {featured.length > 0 ? (
        <div className="mt-10">
          <PropertyGrid properties={featured} />
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            No sample listings for this combination yet
          </p>
          <p className="mt-2 text-sm text-muted">
            Try another rental period, or browse the full demo dataset.
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p className="flex items-center gap-2 text-sm text-muted">
          <FlaskConical className="size-4 shrink-0 text-warning" aria-hidden="true" />
          {ready
            ? `Showing ${featured.length} of ${PROPERTIES.length} fictional listings for ${university.shortName}.`
            : "Loading your selected university…"}
        </p>
        <Link href="/properties" className={buttonClasses("outline", "sm")}>
          Open search
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
