"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, MapPin, Send } from "lucide-react";
import type { Property } from "@/types/property";
import { priceForPeriod } from "@/lib/pricing";
import { formatNaira } from "@/lib/format-currency";
import { useUniversity } from "@/components/university/university-provider";
import { useDemoSession } from "@/components/account/demo-session-provider";
import { SaveButton } from "@/components/properties/save-button";
import { AvailabilityBadge, VerificationBadge } from "@/components/properties/status-badges";
import { Field, TextInput, SelectInput } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/badge";

const MOVE_IN_OPTIONS = [
  "As soon as possible",
  "Next month",
  "Next semester / trimester",
  "Flexible",
];

/**
 * Sticky enquiry panel. Submitting never contacts anyone — the form swaps to a
 * local success state so the whole booking flow can be demonstrated without a
 * backend.
 */
export function EnquiryPanel({ property }: { property: Property }) {
  const { university, period } = useUniversity();
  const { user } = useDemoSession();
  const formId = useId();

  const [submitted, setSubmitted] = useState(false);
  const [moveIn, setMoveIn] = useState(MOVE_IN_OPTIONS[0]);
  const price = priceForPeriod(property, period, university);
  const periodOption = university.rentalPeriods.find((option) => option.id === period);

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          <AvailabilityBadge status={property.availability.status} label={property.availability.label} />
          <VerificationBadge property={property} />
        </div>

        <div className="mt-4 border-t border-line pt-4">
          {price ? (
            <>
              <p className="font-display text-3xl font-bold tracking-tight text-ink">
                {formatNaira(price.amount)}
              </p>
              <p className="mt-1 text-sm text-muted">
                per {periodOption?.shortLabel.toLowerCase() ?? "period"} ·{" "}
                {university.shortName} demo rate
              </p>
              {price.derivation ? (
                <p className="mt-1 text-xs text-faint">
                  {price.basis === "derived" ? "Derived: " : "Listed: "}
                  {formatNaira(price.derivation.baseAmount)} × {price.derivation.periods}{" "}
                  {price.derivation.periodLabel}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="font-display text-xl font-semibold text-ink">
                No {periodOption?.shortLabel.toLowerCase() ?? "rental"} rate listed
              </p>
              <p className="mt-1 text-sm text-muted">
                Switch the rental period in the header to see the rates this listing does offer.
              </p>
            </>
          )}
        </div>

        <ul className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm text-muted">
          <li className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden="true" />
            {property.area} · illustrative demo pin
          </li>
          <li className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden="true" />
            {property.availability.note}
          </li>
        </ul>

        <div className="mt-5 flex gap-2.5">
          <SaveButton propertyId={property.id} propertyTitle={property.title} />
          <span className="self-center text-xs text-faint">
            Saved to this browser only — no account needed.
          </span>
        </div>
      </div>

      {/* Demo enquiry form */}
      <div className="rounded-xl border border-line bg-surface p-5">
        {submitted ? (
          <div className="text-center">
            <span className="mx-auto inline-flex size-11 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </span>
            <h3 className="font-display mt-4 text-lg font-semibold text-ink">Enquiry recorded (demo)</h3>
            <p className="mt-2 text-sm text-muted">
              Nothing was sent anywhere. This success state exists so the template can show the full
              enquiry flow without a server.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <Link href="/dashboard" className={buttonClasses("primary", "md")}>
                View it in the demo dashboard
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className={buttonClasses("ghost", "md")}
              >
                Send another (still a demo)
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">Send an enquiry</h3>
              <p className="mt-1 text-sm text-muted">
                Ask {property.owner.name} about availability for your period.
              </p>
            </div>

            <Field label="Your name" htmlFor={`${formId}-name`}>
              <TextInput
                id={`${formId}-name`}
                name="name"
                autoComplete="name"
                required
                defaultValue={user?.name ?? ""}
                placeholder="e.g. Chidinma O."
              />
            </Field>

            <Field label="Email" htmlFor={`${formId}-email`}>
              <TextInput
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={user?.email ?? ""}
                placeholder="you@example.com"
              />
            </Field>

            <Field
              label="Move-in window"
              htmlFor={`${formId}-move-in`}
              hint="Sample options — no calendar is attached."
            >
              <SelectInput
                id={`${formId}-move-in`}
                name="moveIn"
                value={moveIn}
                onChange={(event) => setMoveIn(event.target.value)}
              >
                {MOVE_IN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Message" htmlFor={`${formId}-message`}>
              <textarea
                id={`${formId}-message`}
                name="message"
                required
                rows={3}
                defaultValue={`Hi, is this listing still available per ${
                  periodOption?.shortLabel.toLowerCase() ?? "period"
                }?`}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-line-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
              />
            </Field>

            <button type="submit" className={buttonClasses("primary", "md", "w-full")}>
              <Send className="size-4" aria-hidden="true" />
              Send enquiry (demo)
            </button>

            <DemoNotice title="No message will be sent">
              This form is client-side only. There is no backend, no landlord notification and no
              stored enquiry in this template.
            </DemoNotice>
          </form>
        )}
      </div>
    </div>
  );
}
