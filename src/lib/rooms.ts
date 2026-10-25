/**
 * Room-level pricing, availability and validation.
 *
 * Deliberately dependency-free (type-only imports) so `npm run check:logic`
 * can exercise it under Node's type stripping, and so every screen resolves
 * room quotes through one implementation.
 */
import type {
  BathroomArrangement,
  PricingBasis,
  Property,
  RoomCapacity,
  RoomConfiguration,
  RoomPrice,
} from "../types/property";
import type { RentalPeriodId, University } from "../types/university";

/** Kept local (not imported from React-adjacent data) so the logic checks stay dependency-free. */
export const SUPPORTED_CAPACITIES: RoomCapacity[] = [1, 2, 3, 4, 5, 6];

const GRADE_LABELS: Record<string, string> = {
  standard: "Standard",
  premium: "Premium",
  executive: "Executive",
  ensuite: "Ensuite",
  deluxe: "Deluxe",
  special: "Special",
};

export function isRoomCapacity(value: number): value is RoomCapacity {
  return (SUPPORTED_CAPACITIES as number[]).includes(value);
}

export function roomLabel(capacity: RoomCapacity, grade?: string): string {
  const gradeLabel = grade ? GRADE_LABELS[grade] : undefined;
  return gradeLabel ? `Room of ${capacity} · ${gradeLabel}` : `Room of ${capacity}`;
}

export interface RoomAvailabilityView {
  status: "available" | "limited" | "fully-booked" | "waitlist";
  label: string;
  tone: "success" | "warning" | "neutral" | "info";
  availableBeds: number;
  /** Bed spaces the room physically contains, when the inventory is known. */
  inventoryBeds: number | null;
  note: string;
}

/**
 * Capacity is not availability. A Room of 4 can have one vacant bed, which is
 * exactly one available space. This function never changes the capacity.
 */
export function roomAvailability(room: RoomConfiguration): RoomAvailabilityView {
  const inventoryBeds =
    room.availability.totalRooms != null
      ? room.availability.totalRooms * room.capacity
      : null;
  const beds = Math.max(0, room.availability.availableBeds);

  if (beds === 0) {
    return {
      status: "fully-booked",
      label: "Fully booked",
      tone: "neutral",
      availableBeds: 0,
      inventoryBeds,
      note: room.availability.note,
    };
  }

  if (beds === 1 || (inventoryBeds != null && beds <= Math.max(1, Math.floor(inventoryBeds * 0.25)))) {
    return {
      status: "limited",
      label: `${beds} ${beds === 1 ? "space" : "spaces"} left`,
      tone: "warning",
      availableBeds: beds,
      inventoryBeds,
      note: room.availability.note,
    };
  }

  return {
    status: "available",
    label: `${beds} ${beds === 1 ? "space" : "spaces"} available`,
    tone: "success",
    availableBeds: beds,
    inventoryBeds,
    note: room.availability.note,
  };
}

function basePeriodPrice(
  room: RoomConfiguration,
  universityId: string,
  period: Exclude<RentalPeriodId, "session">,
): RoomPrice | undefined {
  return (
    room.prices.find((price) => price.period === period && price.universityId === universityId) ??
    room.prices.find((price) => price.period === period && price.universityId == null)
  );
}

/**
 * Resolve the listed room quote for a university + period.
 *
 * Session prices are derived from the university's own period model only when
 * the room lists a base-period quote. Nothing is invented when either figure
 * is missing.
 */
export function roomPriceFor(
  room: RoomConfiguration,
  universityId: string,
  period: RentalPeriodId,
  university: Pick<University, "sessionPeriods">,
): { price: RoomPrice; derivation?: { baseAmount: number; periods: number; periodLabel: string } } | null {
  if (period !== "session") {
    const price =
      room.prices.find((entry) => entry.period === period && entry.universityId === universityId) ??
      room.prices.find((entry) => entry.period === period && entry.universityId == null);
    return price ? { price } : null;
  }

  const explicit =
    room.prices.find((entry) => entry.period === "session" && entry.universityId === universityId) ??
    room.prices.find((entry) => entry.period === "session" && entry.universityId == null);
  if (explicit) return { price: explicit };

  const basePeriod = university.sessionPeriods.basePeriod;
  const base = basePeriodPrice(room, universityId, basePeriod);
  if (!base) return null;

  const count = university.sessionPeriods.count;
  const factor = (value: number | undefined) => (value == null ? undefined : value * count);
  const periodLabel = `${basePeriod}${count === 1 ? "" : "s"}`;

  return {
    price: {
      ...base,
      period: "session",
      totalAmount: factor(base.totalAmount),
      perPersonAmount: factor(base.perPersonAmount),
      depositAmount: base.depositAmount,
      serviceCharge: factor(base.serviceCharge),
      utilityCharge:
        base.utilityCharge == null ? base.utilityCharge : base.utilityCharge * count,
      paymentSchedule: base.paymentSchedule,
      note: base.note,
    },
    derivation: {
      baseAmount: base.totalAmount ?? base.perPersonAmount ?? 0,
      periods: count,
      periodLabel,
    },
  };
}

export interface RoomQuote {
  room: RoomConfiguration;
  price: RoomPrice;
  period: RentalPeriodId;
  basis: PricingBasis;
  /** The headline number matching `basis`. */
  headlineAmount: number;
  /** Whole-room total, only when the landlord listed it. */
  totalAmount: number | null;
  /** Explicit per-person price, only when listed. */
  perPersonAmount: number | null;
  /** Total payable for a given number of occupants, when it can be known. */
  occupants: number | null;
  payableAmount: number | null;
  derivation?: { baseAmount: number; periods: number; periodLabel: string };
}

/**
 * Converts a resolved price into UI-ready figures. It never divides a room
 * total by beds: equal splitting must be explicitly listed by the landlord.
 */
export function roomQuote(
  room: RoomConfiguration,
  universityId: string,
  period: RentalPeriodId,
  university: Pick<University, "sessionPeriods">,
  occupants: number | null = room.capacity,
): RoomQuote | null {
  const resolved = roomPriceFor(room, universityId, period, university);
  if (!resolved) return null;

  const price = resolved.price;
  const basis = price.basis;
  const headlineAmount =
    basis === "per-person"
      ? (price.perPersonAmount ?? price.totalAmount ?? 0)
      : (price.totalAmount ?? price.perPersonAmount ?? 0);

  if (headlineAmount <= 0) return null;

  const payable =
    occupants == null
      ? price.totalAmount ?? null
      : basis === "per-person" && price.perPersonAmount != null
        ? price.perPersonAmount * occupants
        : price.totalAmount ?? null;

  return {
    room,
    price,
    period,
    basis,
    headlineAmount,
    totalAmount: price.totalAmount ?? null,
    perPersonAmount: price.perPersonAmount ?? null,
    occupants,
    payableAmount: payable,
    derivation: resolved.derivation,
  };
}

/** All room configurations that can be quoted for this university/period. */
export function bookableRooms(
  property: Property,
  universityId: string,
  period: RentalPeriodId,
  university: Pick<University, "sessionPeriods">,
): RoomConfiguration[] {
  return property.rooms.filter(
    (room) => roomPriceFor(room, universityId, period, university) != null,
  );
}

export function availableRooms(
  property: Property,
  universityId: string,
  period: RentalPeriodId,
  university: Pick<University, "sessionPeriods">,
): RoomConfiguration[] {
  return bookableRooms(property, universityId, period, university).filter(
    (room) => roomAvailability(room).availableBeds > 0,
  );
}

/** Preferred starting room: available, capacity-aligned with the property. */
export function defaultRoom(
  property: Property,
  universityId: string,
  period: RentalPeriodId,
  university: Pick<University, "sessionPeriods">,
): RoomConfiguration | undefined {
  const candidates = bookableRooms(property, universityId, period, university);
  const available = candidates.filter((room) => roomAvailability(room).availableBeds > 0);
  const pool = available.length > 0 ? available : candidates;
  return (
    pool.find((room) => room.capacity === property.occupancy.maxOccupants) ??
    pool.find((room) => room.capacity === 2) ??
    pool[0]
  );
}

export function totalAvailableBeds(property: Property): number {
  return property.rooms.reduce(
    (total, room) => total + Math.max(0, room.availability.availableBeds),
    0,
  );
}

export function cheapestRoomQuote(
  property: Property,
  universityId: string,
  period: RentalPeriodId,
  university: Pick<University, "sessionPeriods">,
): RoomQuote | null {
  const quotes = property.rooms
    .map((room) => roomQuote(room, universityId, period, university))
    .filter((quote): quote is RoomQuote => quote != null && quote.headlineAmount > 0);
  if (quotes.length === 0) return null;
  return quotes.reduce((cheapest, quote) =>
    quote.headlineAmount < cheapest.headlineAmount ? quote : cheapest,
  );
}

export interface RoomValidationOptions {
  requirePrice?: boolean;
  requirePhoto?: boolean;
  maxAvailableBeds?: number;
}

/** Returns human-readable errors; an empty array means the room is valid. */
export function validateRoom(
  room: RoomConfiguration,
  options: RoomValidationOptions = {},
): string[] {
  const errors: string[] = [];
  const { requirePrice = true, requirePhoto = false, maxAvailableBeds } = options;

  if (!isRoomCapacity(room.capacity)) {
    errors.push("Room capacity must be one of 1, 2, 3, 4, 5 or 6.");
  }
  if (room.maxOccupancy < 1) {
    errors.push("Maximum occupancy must be at least 1.");
  }
  if (room.maxOccupancy > room.capacity) {
    errors.push("Maximum occupancy cannot exceed the room capacity.");
  }
  if (!Number.isInteger(room.availability.availableBeds) || room.availability.availableBeds < 0) {
    errors.push("Available spaces must be a whole number of 0 or more.");
  }
  const inventory =
    room.availability.totalRooms != null
      ? room.availability.totalRooms * room.capacity
      : maxAvailableBeds;
  if (inventory != null && room.availability.availableBeds > inventory) {
    errors.push("Available spaces cannot exceed the room inventory.");
  }
  if (room.availability.totalRooms != null && room.availability.totalRooms < 0) {
    errors.push("Total rooms cannot be negative.");
  }
  if (
    room.availability.availableRooms != null &&
    room.availability.totalRooms != null &&
    room.availability.availableRooms > room.availability.totalRooms
  ) {
    errors.push("Available rooms cannot exceed total rooms.");
  }
  if (requirePrice && room.prices.length === 0) {
    errors.push("Add at least one room price.");
  }
  for (const price of room.prices) {
    if (price.totalAmount == null && price.perPersonAmount == null) {
      errors.push("Each price needs a total-room or per-person amount.");
    }
    if (
      (price.totalAmount != null && price.totalAmount <= 0) ||
      (price.perPersonAmount != null && price.perPersonAmount <= 0)
    ) {
      errors.push("Prices must be greater than zero.");
    }
    if (price.basis === "per-person" && price.perPersonAmount == null) {
      errors.push("A per-person quote needs a per-person amount.");
    }
    if (price.basis === "per-room" && price.totalAmount == null) {
      errors.push("A per-room quote needs a total-room amount.");
    }
  }
  if (requirePhoto && room.photos.length === 0) {
    errors.push("Upload at least one photo for this room type.");
  }
  return errors;
}

/** Group capacity rules kept in one pure place for UI and tests. */
export function groupCapacityErrors({
  room,
  spaces,
  members,
}: {
  room: RoomConfiguration;
  spaces: number;
  members: number;
}): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(spaces) || spaces < 1) {
    errors.push("Choose at least one space.");
  }
  if (spaces > room.capacity) {
    errors.push(`This room holds at most ${room.capacity} people.`);
  }
  if (spaces > room.availability.availableBeds) {
    errors.push(`Only ${room.availability.availableBeds} spaces are currently available.`);
  }
  if (members > spaces) {
    errors.push("The group cannot have more members than spaces.");
  }
  return errors;
}

export function bathroomLabel(value: BathroomArrangement): string {
  if (value === "private") return "Private bathroom";
  if (value === "shared") return "Shared bathroom";
  return "Bathroom not specified";
}

export function roomBedsLabel(room: RoomConfiguration): string {
  return room.bedConfiguration || `${room.capacity} bed spaces`;
}
