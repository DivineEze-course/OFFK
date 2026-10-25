import { BadgeCheck, Ruler, SlidersHorizontal } from "lucide-react";
import { DemoBadge } from "@/components/ui/badge";

const REASONS = [
  {
    icon: Ruler,
    title: "Distance you can actually interpret",
    body: "Every listing shows a Haversine straight-line distance between two demo pins, labelled as illustrative and never dressed up as a commute time. No routing service is involved anywhere in this template.",
    points: ["Straight-line only", "Computed from the same pins the map draws", "Never labelled as travel distance"],
  },
  {
    icon: SlidersHorizontal,
    title: "Amenities that filter, not decorate",
    body: "Each amenity is a typed record with its own icon, label and clarification note, so the same list drives the filter panel, the detail grid and the demo disclosures.",
    points: ["15 amenity categories", "Notes flag sample claims", "Multi-select filtering"],
  },
  {
    icon: BadgeCheck,
    title: "Pricing that speaks your calendar",
    body: "Choose Nile and rent reads per semester; choose Baze and it reads per trimester. When a listing doesn't offer your period, OFFK says so instead of inventing a number.",
    points: ["Semester and trimester models", "Derived session maths shown openly", "'Not offered' beats a guess"],
  },
];

/** Why the three product principles matter — static editorial section. */
export function WhyOffk() {
  return (
    <section className="page-container py-16 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Why it matters</p>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
          Built around the three things students get wrongest
        </h2>
        <p className="mt-4 text-base text-muted">
          Distance, amenities and price are where off-campus shopping goes sideways. OFFK makes each
          one explicit — and flags every fictional figure it shows.
        </p>
        <div className="mt-5">
          <DemoBadge label="All figures below are demo data" />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {REASONS.map((reason) => (
          <article key={reason.title} className="flex flex-col rounded-xl border border-line bg-surface p-6">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent text-on-accent">
              <reason.icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="font-display mt-5 text-lg font-semibold text-ink">{reason.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{reason.body}</p>
            <ul className="mt-4 space-y-2 border-t border-line pt-4">
              {reason.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-xs text-faint">
                  <span aria-hidden="true" className="mt-1 size-1.5 shrink-0 rounded-full bg-accent-strong" />
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
