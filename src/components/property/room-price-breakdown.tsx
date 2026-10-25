"use client";

import { Info, Minus } from "lucide-react";
import { pricingBasisLabel, roomQuote } from "@/lib/rooms";
import { formatNaira } from "@/lib/format-currency";
import { useRoomSelection } from "@/components/property/room-selection";
import { useUniversity } from "@/components/university/university-provider";
import { DemoBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

/**
 * Prices for the selected room across every rental period the selected
 * university offers. A period the room doesn't sell is shown as "Not offered";
 * no number is ever invented, and no price appears without its basis
 * (per person / per room) and its rental period.
 */
export function RoomPriceBreakdown() {
  const { selectedRoom } = useRoomSelection();
  const { university, period } = useUniversity();

  if (!selectedRoom) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface-2 p-5 text-sm text-muted">
        No room types are listed, so there is no price to show.
      </div>
    );
  }

  const rows = university.rentalPeriods.map((option) => ({
    option,
    quote: roomQuote(selectedRoom, university.id, option.id, university),
  }));
  const active = rows.find((row) => row.option.id === period)?.quote ?? null;

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            {selectedRoom.name} · {university.shortName}
          </p>
          <p className="mt-1 text-xs text-faint">
            Rates for this room type. Switch rooms above to compare.
          </p>
        </div>
        <DemoBadge label="Demo price" />
      </div>

      <dl className="mt-4 divide-y divide-line border-t border-line">
        {rows.map(({ option, quote }) => {
          const selected = option.id === period;
          return (
            <div key={option.id} className="flex items-start justify-between gap-4 py-3.5">
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
                {quote ? (
                  <>
                    <span className="font-display block text-xl font-bold tracking-tight text-ink">
                      {formatNaira(quote.headlineAmount)}
                    </span>
                    <span className="block text-xs font-medium text-muted">
                      {pricingBasisLabel(quote.basis)} · per {option.shortLabel.toLowerCase()}
                    </span>
                    {quote.basis === "per-person" ? (
                      <span className="block text-[11px] leading-snug text-faint">
                        {quote.totalAmount != null
                          ? `Whole room: ${formatNaira(quote.totalAmount)} (listed separately)`
                          : "Whole-room total not listed"}
                      </span>
                    ) : (
                      <span className="block text-[11px] leading-snug text-faint">
                        {quote.perPersonAmount != null
                          ? `Per person: ${formatNaira(quote.perPersonAmount)} (listed separately)`
                          : "No per-person price listed — not split equally"}
                      </span>
                    )}
                    {quote.derivation ? (
                      <span className="block text-[11px] leading-snug text-faint">
                        Derived: {formatNaira(quote.derivation.baseAmount)} ×{" "}
                        {quote.derivation.periods} {quote.derivation.periodLabel}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-muted",
                    )}
                  >
                    <Minus className="size-3" aria-hidden="true" />
                    Not offered
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      {active ? (
        <dl className="mt-1 space-y-2 border-t border-line pt-4 text-sm">
          <Line
            label="Deposit"
            value={
              active.price.depositAmount != null
                ? `${formatNaira(active.price.depositAmount)} · ${
                    active.price.refundableDeposit ? "refundable" : "non-refundable"
                  }`
                : "None listed"
            }
          />
          <Line
            label="Service charge"
            value={
              active.price.serviceCharge
                ? `${formatNaira(active.price.serviceCharge)} (non-refundable)`
                : "None listed"
            }
          />
          <Line
            label="Utilities"
            value={
              active.price.utilityCharge != null
                ? formatNaira(active.price.utilityCharge)
                : (active.price.utilityNote ?? "Not specified")
            }
          />
          {active.price.paymentSchedule?.length ? (
            <div>
              <dt className="text-xs font-semibold tracking-[0.12em] text-faint uppercase">
                Payment schedule
              </dt>
              <dd className="mt-1">
                <ol className="list-inside list-decimal space-y-0.5 text-sm text-muted">
                  {active.price.paymentSchedule.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {active?.price.note ? (
        <p className="mt-4 flex items-start gap-2 px-1 text-xs text-faint">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {active.price.note}
        </p>
      ) : null}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
