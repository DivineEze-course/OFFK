/**
 * University-aware pricing.
 *
 * This is the single source of truth for every price shown in the app. UI
 * components never compute prices themselves.
 *
 * Demo models
 * -----------
 * - Nile University: 1 academic session = 2 semesters.
 *     session price = semesterPrice × 2 (unless the listing defines one).
 * - Baze University: trimester-based. The demo model treats a full session as
 *   3 trimesters, but a listing may define its own `sessionPrice` /
 *   `sessionIncludes` whenever its actual rental terms differ.
 *
 * This module is deliberately free of runtime imports so it can be exercised
 * directly by `scripts/check-libs.ts` (see `npm run check:logic`).
 */
import type { Property, RentalPricing } from "../types/property";
import type { RentalPeriodId, RentalPeriodOption, University } from "../types/university";

/** Structured formula the UI renders, e.g. "₦350,000 × 2 semesters". */
export interface PriceDerivation {
  baseAmount: number;
  periods: number;
  /** Base period plural label, e.g. "semesters" / "trimesters". */
  periodLabel: string;
}

export interface PeriodPrice {
  period: RentalPeriodId;
  amount: number;
  /** `listed` = the landlord stated it; `derived` = computed by the demo model. */
  basis: "listed" | "derived";
  derivation?: PriceDerivation;
}

function basePeriodForSession(university: University): Exclude<RentalPeriodId, "session"> {
  return university.sessionPeriods.basePeriod;
}

function basePeriodAmount(
  pricing: RentalPricing,
  period: Exclude<RentalPeriodId, "session">,
): number | undefined {
  return period === "semester" ? pricing.semesterPrice : pricing.trimesterPrice;
}

function universitySupports(university: University, period: RentalPeriodId): boolean {
  return university.rentalPeriods.some((option) => option.id === period);
}

function plural(period: Exclude<RentalPeriodId, "session">, count: number): string {
  const singular = period === "semester" ? "semester" : "trimester";
  return count === 1 ? singular : `${singular}s`;
}

/**
 * Resolves the price of `property` for `period` under `university`'s model.
 * Returns `null` when the period is unsupported or the listing has no price
 * for it — callers must render a graceful "not offered" state instead of
 * inventing a number.
 */
export function priceForPeriod(
  property: Property,
  period: RentalPeriodId,
  university: University,
): PeriodPrice | null {
  if (!universitySupports(university, period)) return null;
  const pricing = property.pricing;

  if (period === "semester" || period === "trimester") {
    const amount = basePeriodAmount(pricing, period);
    return amount == null ? null : { period, amount, basis: "listed" };
  }

  // Full academic session.
  if (pricing.sessionPrice != null) {
    const includes = pricing.sessionIncludes ?? university.sessionPeriods.count;
    const base = basePeriodAmount(pricing, basePeriodForSession(university));
    const differsFromModel = includes !== university.sessionPeriods.count;
    return {
      period,
      amount: pricing.sessionPrice,
      basis: "listed",
      derivation:
        differsFromModel && base != null
          ? {
              baseAmount: base,
              periods: includes,
              periodLabel: plural(basePeriodForSession(university), includes),
            }
          : undefined,
    };
  }

  const base = basePeriodAmount(pricing, basePeriodForSession(university));
  if (base == null) return null;

  const { count, basePeriod } = university.sessionPeriods;
  return {
    period,
    amount: base * count,
    basis: "derived",
    derivation: { baseAmount: base, periods: count, periodLabel: plural(basePeriod, count) },
  };
}

export interface SessionComparison {
  derivedAmount: number;
  derivedDerivation: PriceDerivation;
  explicitAmount: number;
  /** Positive when paying the full session up front is cheaper in the demo model. */
  saving: number;
}

/**
 * Compares the derived session price against an explicitly listed one.
 * Only meaningful when the listing provides both and the explicit price is
 * lower than the derived one.
 */
export function sessionComparison(
  property: Property,
  university: University,
): SessionComparison | null {
  const explicit = property.pricing.sessionPrice;
  if (explicit == null) return null;

  const basePeriod = basePeriodForSession(university);
  const base = basePeriodAmount(property.pricing, basePeriod);
  if (base == null) return null;

  const { count } = university.sessionPeriods;
  const derivedAmount = base * count;
  const saving = derivedAmount - explicit;
  if (saving <= 0) return null;

  return {
    derivedAmount,
    derivedDerivation: { baseAmount: base, periods: count, periodLabel: plural(basePeriod, count) },
    explicitAmount: explicit,
    saving,
  };
}

/** Rental options for this property/university pair, each with resolved price or `null`. */
export function periodOptionsFor(
  property: Property,
  university: University,
): Array<RentalPeriodOption & { price: PeriodPrice | null }> {
  return university.rentalPeriods.map((option) => ({
    ...option,
    price: priceForPeriod(property, option.id, university),
  }));
}

/** The default period to preselect: first supported option with an available price. */
export function defaultPeriodFor(property: Property, university: University): RentalPeriodId {
  const withPrice = periodOptionsFor(property, university).find((option) => option.price);
  return withPrice?.id ?? university.rentalPeriods[0].id;
}

/**
 * A comparable "from" price used for sorting and budget filters: the cheapest
 * resolved price across the university's rental options. Returns `null` when
 * the listing cannot be priced for this university at all.
 */
export function fromPrice(property: Property, university: University): PeriodPrice | null {
  const priced = periodOptionsFor(property, university).filter((option) => option.price != null);
  if (priced.length === 0) return null;
  return priced.reduce((cheapest, option) =>
    (option.price as PeriodPrice).amount < (cheapest.price as PeriodPrice).amount ? option : cheapest,
  ).price;
}
