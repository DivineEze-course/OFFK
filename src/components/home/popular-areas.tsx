"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { PROPERTIES } from "@/data/properties";
import { matchesUniversityAndPeriod } from "@/lib/filters";
import { useUniversity } from "@/components/university/university-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatStraightLineDistance, illustrativeStraightLineKm } from "@/lib/distance";
import { getUniversity } from "@/data/universities";

/**
 * Popular demo neighbourhoods around the selected campus. Counts and
 * distances come from the demo dataset only; every link lands on a filtered
 * search page.
 */
export function PopularAreas() {
  const { university, period } = useUniversity();

  const areas = new Map<string, { count: number; nearestKm: number }>();
  for (const property of PROPERTIES) {
    if (!matchesUniversityAndPeriod(property, university, period)) continue;
    const km = illustrativeStraightLineKm(
      getUniversity(property.universityIds[0]).coords,
      property.coords,
    );
    const existing = areas.get(property.area);
    if (existing) {
      existing.count += 1;
      existing.nearestKm = Math.min(existing.nearestKm, km);
    } else {
      areas.set(property.area, { count: 1, nearestKm: km });
    }
  }

  const sorted = [...areas.entries()].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]));

  return (
    <section className="border-y border-line bg-surface">
      <div className="page-container py-16 lg:py-20">
        <SectionHeading
          eyebrow="Popular student locations"
          title={`Neighbourhoods around ${university.shortName}`}
          description="Sample areas drawn from the demo dataset. Distances are illustrative straight-line estimates from each area's nearest demo pin to the campus-area pin — never travel distances."
        />

        {sorted.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map(([area, info]) => (
              <li key={area}>
                <Link
                  href={`/properties?university=${university.id}&period=${period}&area=${encodeURIComponent(area)}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-canvas px-5 py-4 transition-colors hover:border-line-strong hover:bg-surface-2"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-surface-2 text-muted transition-colors group-hover:bg-accent group-hover:text-on-accent">
                      <MapPin className="size-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="font-display block text-base font-semibold text-ink">{area}</span>
                      <span className="block text-xs text-faint">
                        {info.count} sample listing{info.count === 1 ? "" : "s"} ·{" "}
                        {formatStraightLineDistance(info.nearestKm)} straight-line (illustrative)
                      </span>
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-faint transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-sm text-muted">
            No demo areas available for this university and rental period combination yet.
          </p>
        )}
      </div>
    </section>
  );
}
