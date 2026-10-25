"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, MapPin, Send } from "lucide-react";
import type { Property } from "@/types/property";
import { pricingBasisLabel, roomAvailability, roomQuote, spacesSummary } from "@/lib/rooms";
import { formatNaira } from "@/lib/format-currency";
import { useUniversity } from "@/components/university/university-provider";
import { useDemoSession } from "@/components/account/demo-session-provider";
import { useRoomSelection } from "@/components/property/room-selection";
import { SaveButton } from "@/components/properties/save-button";
import { VerificationBadge } from "@/components/properties/status-badges";
import { Badge } from "@/components/ui/badge";
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
 * Sticky enquiry panel for the room type currently selected on the page.
 * Submitting never contacts anyone — the form swaps to a local success state so
 * the flow can be demonstrated without a backend. An enquiry also never
 * reduces availability.
 */
export function EnquiryPanel({ property }: { property: Property }) {
  const { university, period } = useUniversity();
  const { user } = useDemoSession();
  const { selectedRoom } = useRoomSelection();
  const formId = useId();

  const [submitted, setSubmitted] = useState(false);
  const [moveIn, setMoveIn] = useState(MOVE_IN_OPTIONS[0]);
  const [occupantsChoice, setOccupantsChoice] = useState(1);
  const [typedMessage, setTypedMessage] = useState<string | null>(null);

  const periodOption = university.rentalPeriods.find((option) => option.id === period);
  const periodLabel = periodOption?.shortLabel.toLowerCase() ?? "period";

  const availability = selectedRoom ? roomAvailability(selectedRoom) : null;
  const maxOccupants = selectedRoom
    ? Math.max(1, Math.min(selectedRoom.capacity, availability?.availableBeds ?? 1))
    : 1;
  const occupants = Math.min(Math.max(occupantsChoice, 1), maxOccupants);
  const quote = selectedRoom
    ? roomQuote(selectedRoom, university.id, period, university, occupants)
    : null;

  const defaultMessage = selectedRoom
    ? `Hi, is the ${selectedRoom.name} still available per ${periodLabel}?`
    : "Hi, is this listing still available?";
  const message = typedMessage ?? defaultMessage;

  const blockedReason = !property.acceptsEnquiries
    ? "This landlord is not accepting enquiries right now."
    : !selectedRoom
      ? "This listing has no room types to enquire about yet."
      : availability && availability.availableBeds === 0
        ? `${selectedRoom.name} has no free spaces. Choose another room type to send an enquiry.`
        : null;

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          {availability ? <Badge tone={availability.tone}>{availability.label}</Badge> : null}
          <VerificationBadge property={property} />
        </div>

        {selectedRoom ? (
          <p className="mt-3 text-sm font-semibold text-ink">{selectedRoom.name}</p>
        ) : null}

        <div className="mt-3 border-t border-line pt-4">
          {quote ? (
            <>
              <p className="font-display text-3xl font-bold tracking-tight text-ink">
                {formatNaira(quote.headlineAmount)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {pricingBasisLabel(quote.basis)} · per {periodLabel} · {university.shortName} demo
                rate
              </p>
              {quote.basis === "per-person" && quote.payableAmount != null && occupants > 1 ? (
                <p className="mt-1 text-xs text-faint">
                  {occupants} people: {formatNaira(quote.payableAmount)} (each person is quoted
                  separately)
                </p>
              ) : null}
              {quote.basis === "per-room" ? (
                <p className="mt-1 text-xs text-faint">
                  Quoted for the whole room — not split between occupants.
                </p>
              ) : null}
              {quote.derivation ? (
                <p className="mt-1 text-xs text-faint">
                  Derived: {formatNaira(quote.derivation.baseAmount)} × {quote.derivation.periods}{" "}
                  {quote.derivation.periodLabel}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="font-display text-xl font-semibold text-ink">
                No {periodLabel} rate listed
              </p>
              <p className="mt-1 text-sm text-muted">
                {selectedRoom
                  ? `${selectedRoom.name} has no ${periodLabel} rate. Switch the rental period in the header or pick another room type.`
                  : "Switch the rental period in the header to see the rates this listing does offer."}
              </p>
            </>
          )}
        </div>

        <ul className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm text-muted">
          <li className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden="true" />
            {property.area} ·{" "}
            {property.location.verification === "google-verified"
              ? "Google-verified pin"
              : "illustrative demo pin"}
          </li>
          <li className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden="true" />
            {selectedRoom ? spacesSummary(selectedRoom) : property.availability.note}
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
              Nothing was sent anywhere
              {selectedRoom ? ` and no space in ${selectedRoom.name} was reserved` : ""}. This
              success state exists so the template can show the full enquiry flow without a server.
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
              if (blockedReason) return;
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">Send an enquiry</h3>
              <p className="mt-1 text-sm text-muted">
                {selectedRoom
                  ? `Ask ${property.owner.name} about the ${selectedRoom.name} for your period.`
                  : `Ask ${property.owner.name} about availability for your period.`}
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

            {selectedRoom ? (
              <Field
                label="Number of people"
                htmlFor={`${formId}-occupants`}
                hint={`Up to ${maxOccupants} — limited by the room's capacity (${selectedRoom.capacity}) and its free spaces.`}
              >
                <SelectInput
                  id={`${formId}-occupants`}
                  name="occupants"
                  value={occupants}
                  onChange={(event) => setOccupantsChoice(Number(event.target.value))}
                >
                  {Array.from({ length: maxOccupants }, (_, index) => index + 1).map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? "person" : "people"}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            ) : null}

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
                value={message}
                onChange={(event) => setTypedMessage(event.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-line-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
              />
            </Field>

            {blockedReason ? (
              <p role="alert" className="rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-muted">
                {blockedReason}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={blockedReason != null}
              className={buttonClasses("primary", "md", "w-full")}
            >
              <Send className="size-4" aria-hidden="true" />
              Send enquiry (demo)
            </button>

            <DemoNotice title="No message will be sent">
              This form is client-side only. There is no backend, no landlord notification and no
              stored enquiry in this template. Sending it would not hold or reduce any room space.
            </DemoNotice>
          </form>
        )}
      </div>
    </div>
  );
}
