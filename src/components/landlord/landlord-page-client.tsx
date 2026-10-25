"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building,
  CheckCircle2,
  Eye,
  MessageSquare,
  Plus,
  TrendingUp,
} from "lucide-react";
import { DEMO_LANDLORD } from "@/data/demo";
import { PROPERTIES, getProperty } from "@/data/properties";
import { getUniversity } from "@/data/universities";
import { useUniversity } from "@/components/university/university-provider";
import { PropertyGrid } from "@/components/properties/property-card";
import { AvailabilityBadge } from "@/components/properties/status-badges";
import { DemoBadge, DemoNotice } from "@/components/ui/badge";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const STEPS = [
  "Add the address area and who it serves",
  "Set a semester or trimester price — session maths is derived",
  "Upload photos and amenity claims",
  "Publish for review (demo only)",
];

/**
 * Landlord workspace: a demo overview, an enquiry feed and a "create listing"
 * form that validates locally and confirms without contacting anything.
 */
export function LandlordPageClient() {
  const { university } = useUniversity();
  const landlord = DEMO_LANDLORD;

  return (
    <div className="page-container py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            For landlords
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {landlord.name.replace(/\s*\(.*\)$/, "")}&apos;s landlord workspace
          </h1>
          <p className="mt-3 text-base text-muted">
            Portfolio overview, enquiry feed and a listing builder — all running on the sample
            records this template ships with.
          </p>
        </div>
        <DemoBadge label="Demo workspace" />
      </header>

      <div className="mt-6">
        <DemoNotice title="Sample portfolio, sample figures">
          Views, enquiry counts, occupancy and response rates below are invented strings from{" "}
          <code className="rounded bg-warning-soft px-1 py-0.5 text-[0.85em]">data/demo.ts</code>{" "}
          — nothing is measured, stored or published.
        </DemoNotice>
      </div>

      {/* --------------------------------------------------------- summary */}
      <section aria-label="Portfolio summary" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {landlord.summary.map((entry, index) => (
          <div key={entry.label} className="rounded-xl border border-line bg-surface p-5">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-surface-2 text-muted">
              {index === 0 ? (
                <Building className="size-4" aria-hidden="true" />
              ) : index === 1 ? (
                <TrendingUp className="size-4" aria-hidden="true" />
              ) : index === 2 ? (
                <MessageSquare className="size-4" aria-hidden="true" />
              ) : (
                <BadgeCheck className="size-4" aria-hidden="true" />
              )}
            </span>
            <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-faint uppercase">
              {entry.label}
            </p>
            <p className="font-display mt-1 text-2xl font-bold tracking-tight text-ink">
              {entry.value}
            </p>
            <p className="mt-1 text-xs text-faint">{entry.note}</p>
          </div>
        ))}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* ------------------------------------------------------ listings */}
        <section aria-labelledby="my-listings">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="my-listings" className="font-display text-xl font-semibold text-ink">
              Demo listings
            </h2>
            <span className="text-xs text-faint">{landlord.portfolioNote}</span>
          </div>

          <ul className="mt-4 space-y-3">
            {landlord.listings.map((listing) => {
              const property = getProperty(listing.propertyId);
              if (!property) return null;
              const isLive = listing.status === "Live";

              return (
                <li
                  key={listing.propertyId}
                  className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-ink">
                        <Link href={`/properties/${property.id}`} className="hover:underline">
                          {property.title}
                        </Link>
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {property.area} ·{" "}
                        {getUniversity(property.universityIds[0]).shortName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                        listing.status === "Live"
                          ? "bg-success-soft text-success"
                          : listing.status === "Draft"
                            ? "border border-line bg-surface-2 text-muted"
                            : "bg-warning-soft text-warning",
                      )}
                    >
                      {listing.status}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 border-t border-line pt-3 text-xs sm:grid-cols-3">
                    <div className="flex items-center gap-1.5">
                      <Eye className="size-3.5 text-faint" aria-hidden="true" />
                      <dd className="text-muted">{listing.viewsNote}</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 text-faint" aria-hidden="true" />
                      <dd className="text-muted">{listing.enquiriesNote}</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-faint" aria-hidden="true" />
                      <dd className="text-muted">{listing.occupancy}</dd>
                    </div>
                  </dl>

                  <div className="mt-3">
                    <AvailabilityBadge
                      status={
                        listing.status === "Fully booked"
                          ? "fully-booked"
                          : isLive
                            ? "available"
                            : "waitlist"
                      }
                      label={
                        listing.status === "Fully booked"
                          ? "Fully booked (sample)"
                          : isLive
                            ? "Live (demo)"
                            : "Not published (sample)"
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 border-t border-line pt-6">
            <h3 className="font-display text-lg font-semibold text-ink">Preview on the marketplace</h3>
            <p className="mt-1 text-sm text-muted">
              These demo listings as students see them, priced for the currently selected{" "}
              {university.shortName} calendar.
            </p>
            <div className="mt-5">
              <PropertyGrid
                properties={landlord.listings
                  .map((listing) => getProperty(listing.propertyId))
                  .filter((property): property is NonNullable<typeof property> => Boolean(property))
                  .slice(0, 3)}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ side column */}
        <div className="space-y-8">
          <CreateListingForm />

          <section aria-labelledby="enquiries" className="rounded-xl border border-line bg-surface p-5">
            <h2 id="enquiries" className="font-display text-xl font-semibold text-ink">
              New enquiries
            </h2>
            <ul className="mt-4 space-y-4">
              {landlord.enquiries.map((enquiry) => {
                const property = getProperty(enquiry.propertyId);
                return (
                  <li key={enquiry.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-ink">{enquiry.fromLabel}</p>
                      <span className="text-xs text-faint">{enquiry.whenLabel}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted">{enquiry.message}</p>
                    {property ? (
                      <p className="mt-1.5 text-xs text-faint">
                        Re:{" "}
                        <Link href={`/properties/${property.id}`} className="underline underline-offset-2">
                          {property.title}
                        </Link>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Local-only listing form: validates, then confirms without submitting. */
function CreateListingForm() {
  const formId = useId();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <section className="rounded-xl border border-line bg-surface p-5">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <h2 className="font-display mt-4 text-lg font-semibold text-ink">
          Listing saved locally (demo)
        </h2>
        <p className="mt-2 text-sm text-muted">
          Nothing was published, uploaded or queued for review — this confirmation exists purely to
          demonstrate the create-listing flow.
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className={buttonClasses("outline", "sm")}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add another (still a demo)
          </button>
          <Link href="/properties" className={buttonClasses("ghost", "sm")}>
            View the marketplace
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="create-listing" className="rounded-xl border border-line bg-surface p-5">
      <h2 id="create-listing" className="font-display text-xl font-semibold text-ink">
        Create a listing
      </h2>
      <ol className="mt-3 space-y-1.5">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-2 text-xs text-faint">
            <span className="font-semibold text-muted">{index + 1}.</span>
            {step}
          </li>
        ))}
      </ol>

      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <Field label="Listing title" htmlFor={`${formId}-title`}>
          <TextInput
            id={`${formId}-title`}
            name="title"
            required
            placeholder="e.g. Jabi shared room (2 beds)"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Area" htmlFor={`${formId}-area`}>
            <TextInput id={`${formId}-area`} name="area" required placeholder="e.g. Jabi" />
          </Field>
          <Field label="Serves" htmlFor={`${formId}-university`}>
            <SelectInput id={`${formId}-university`} name="university" defaultValue="nile">
              <option value="nile">Nile University</option>
              <option value="baze">Baze University</option>
              <option value="both">Both (cross-campus)</option>
            </SelectInput>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Semester price"
            htmlFor={`${formId}-semester`}
            hint="Nile model — 1 session = 2 semesters."
          >
            <TextInput
              id={`${formId}-semester`}
              name="semester"
              type="number"
              min={0}
              step={1000}
              placeholder="350000"
            />
          </Field>
          <Field
            label="Trimester price"
            htmlFor={`${formId}-trimester`}
            hint="Baze model — 1 session = 3 trimesters."
          >
            <TextInput
              id={`${formId}-trimester`}
              name="trimester"
              type="number"
              min={0}
              step={1000}
              placeholder="260000"
            />
          </Field>
        </div>

        <p className="text-xs text-faint">
          Session pricing is derived from whichever base period you fill in; override it with an
          explicit session figure if the real deal differs from the model.
        </p>

        <button type="submit" className={buttonClasses("primary", "md", "w-full")}>
          <Plus className="size-4" aria-hidden="true" />
          Save listing (demo)
        </button>

        <p className="text-center text-xs text-faint">
          {PROPERTIES.length} demo listings already in the dataset — none were created by this form.
        </p>
      </form>
    </section>
  );
}
