import type { LatLng, RentalPeriodId } from "./university";

/** All accommodation categories offered in the demo dataset. */
export type AccommodationTypeId =
  | "shared-room"
  | "private-room"
  | "studio"
  | "one-bedroom"
  | "shared-apartment"
  | "two-bedroom";

export interface AccommodationTypeMeta {
  id: AccommodationTypeId;
  label: string;
  /** Short description used in filter lists. */
  description: string;
}

export type FurnishingLevel = "furnished" | "semi-furnished" | "unfurnished";

export interface FurnishingMeta {
  id: FurnishingLevel;
  label: string;
}

/** Icon keys resolve to Lucide icons in `components/properties/amenity-icon.tsx`. */
export type AmenityId =
  | "wifi"
  | "power"
  | "generator"
  | "water"
  | "furnished"
  | "kitchen"
  | "private-bathroom"
  | "shared-bathroom"
  | "security"
  | "cctv"
  | "parking"
  | "laundry"
  | "air-conditioning"
  | "study-area"
  | "borehole"
  | "desk"
  | "wardrobe"
  | "reading-lamp"
  | "fan"
  | "locker"
  | "balcony"
  | "water-heater"
  | "microwave"
  | "refrigerator"
  | "cooktop"
  | "cleaning"
  | "common-room"
  | "gym"
  | "bicycle-storage"
  | "accessible"
  | "fire-safety";

export interface AmenityMeta {
  id: AmenityId;
  label: string;
  /** One-line clarification, e.g. "24/7 security (demo data)". */
  note: string;
}

export interface PropertyImage {
  src: string;
  alt: string;
  /** `illustration` images are local SVG demos; `photo` images are licensed stock. */
  kind?: "illustration" | "photo" | "upload";
  /** Short credit/licence line shown where a photo appears. */
  credit?: string;
  isDemo?: boolean;
}

/**
 * University-aware rental pricing.
 *
 * Prices are stored per base period (`semesterPrice` / `trimesterPrice`).
 * `sessionPrice` is an optional override for landlords whose actual rental
 * terms differ from the university's default "session = N periods" model
 * (e.g. a negotiated discount for paying the whole session up front).
 *
 * This legacy property-level shape remains the fallback for aggregate "from"
 * prices. Room-level quotes live on `RoomConfiguration.prices`; the UI must use
 * those for anything a student could actually book.
 */
export interface RentalPricing {
  currency: "NGN";
  /** Nile University — per semester. */
  semesterPrice?: number;
  /** Baze University — per trimester. */
  trimesterPrice?: number;
  /** Explicit full-session price. Wins over the derived price when present. */
  sessionPrice?: number;
  /** How many base periods the explicit `sessionPrice` covers (defaults to the university model). */
  sessionIncludes?: number;
}

export type AvailabilityStatus = "available" | "limited" | "fully-booked" | "waitlist";

export interface Availability {
  status: AvailabilityStatus;
  label: string;
  /** Always demo data — surfaced verbatim in the UI. */
  note: string;
  isSample: true;
}

export interface HouseRule {
  id: string;
  label: string;
  description: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  role: string;
  joinedLabel: string;
  /** Free-text demo stats — never presented as verified metrics. */
  responseNote: string;
  contactLabel: string;
  isDemo: true;
}

export interface OccupancyInfo {
  description: string;
  maxOccupants: number;
  bathrooms: number;
  bedrooms: number;
  sizeNote: string;
}

export interface NearbyLandmark {
  name: string;
  note: string;
}

/* ------------------------------------------------------------------ *
 * Room capacities, grades, pricing basis and structured room records
 * ------------------------------------------------------------------ */

/**
 * The only room capacities OFFK supports. These are structured values, not
 * free-text labels: every price, availability count and group-size check is
 * anchored to one of these six numbers.
 */
export type RoomCapacity = 1 | 2 | 3 | 4 | 5 | 6;

export interface RoomCapacityMeta {
  capacity: RoomCapacity;
  label: string;
  /** Plain-language explanation of the room configuration. */
  description: string;
}

export type RoomGradeId =
  | "standard"
  | "premium"
  | "executive"
  | "ensuite"
  | "deluxe"
  | "special";

export interface RoomGradeMeta {
  id: RoomGradeId;
  label: string;
  description: string;
}

/** How a room quote is expressed. Total and per-person figures stay separate. */
export type PricingBasis = "per-room" | "per-person";

export interface PricingBasisMeta {
  id: PricingBasis;
  label: string;
  shortLabel: string;
  description: string;
}

export type BathroomArrangement = "private" | "shared" | "not-specified";

export interface BathroomArrangementMeta {
  id: BathroomArrangement;
  label: string;
  description: string;
}

/**
 * One quote for one room configuration under one university/period pair.
 *
 * `totalAmount` is the price of the whole room for that period.
 * `perPersonAmount` is an explicitly listed per-student price.
 * They are separate fields on purpose — the app never assumes every occupant
 * pays an equal share, and never derives one figure from the other unless the
 * landlord listed both.
 */
export interface RoomPrice {
  /** Restrict this quote to one university. Omit when it applies to all. */
  universityId?: string;
  period: RentalPeriodId;
  totalAmount?: number;
  perPersonAmount?: number;
  /** Which figure is the headline quote for this room. */
  basis: PricingBasis;
  currency: "NGN";
  /** Refundable amount, kept distinct from rent. */
  depositAmount?: number;
  refundableDeposit?: boolean;
  /** Non-refundable service/management charge for the period. */
  serviceCharge?: number;
  /** Utility charge for the period; `null` means usage-based. */
  utilityCharge?: number | null;
  utilityNote?: string;
  /** Ordered schedule, e.g. ["60% on acceptance", "40% before move-in"]. */
  paymentSchedule?: string[];
  /** Demo-only caveat, shown next to the quote. */
  note?: string;
  isSample: true;
}

export interface RoomAvailability {
  /** How many identical rooms of this configuration the property has. */
  totalRooms: number | null;
  /** How many of those rooms have at least one free space. */
  availableRooms: number | null;
  /** Vacant bed spaces across all rooms of this configuration. */
  availableBeds: number;
  /** Optional extra explanation shown in the UI. */
  note: string;
  isSample: true;
}

export interface RoomConfiguration {
  id: string;
  /** Always one of the six structured capacities. */
  capacity: RoomCapacity;
  grade: RoomGradeId;
  /** Display name is derived, but stored so shared links stay readable. */
  name: string;
  /** Maximum people allowed in one room; normally equals `capacity`. */
  maxOccupancy: number;
  bedConfiguration: string;
  bathroom: BathroomArrangement;
  bathroomNote: string;
  furnishing: FurnishingLevel;
  /** Room-specific amenities in addition to the property-wide list. */
  amenities: AmenityId[];
  description: string;
  /** Photos for this room type only. May be empty — the UI says so honestly. */
  photos: PropertyImage[];
  prices: RoomPrice[];
  availability: RoomAvailability;
  /** Display edge cases honestly rather than inventing a photo or a price. */
  isSample: true;
}

export interface PropertyLocation {
  coords: LatLng;
  /** Google-formatted address when a landlord selected a Place. */
  formattedAddress?: string;
  placeId?: string;
  /**
   * `google-verified` = selected through Google Places and confirmed on a map.
   * `demo-unverified` = illustrative demo pin. `unverified` = no location yet.
   */
  verification: "google-verified" | "demo-unverified" | "unverified";
  note: string;
}

export interface PropertyContact {
  name: string;
  role: string;
  email: string;
  phoneDisplay: string;
  isDemo: boolean;
}

export type ListingStatus = "draft" | "published" | "paused" | "archived";

export interface Property {
  id: string;
  title: string;
  /** Demo neighbourhood label (illustrative — not an exact address). */
  area: string;
  /** Universities this listing serves. Prices follow each university's model. */
  universityIds: string[];
  type: AccommodationTypeId;
  furnishing: FurnishingLevel;
  /** Aggregate fallback pricing. Room-level quotes are authoritative. */
  pricing: RentalPricing;
  /** Property-level photos (exterior/common areas), separate from room photos. */
  images: PropertyImage[];
  /**
   * Illustrative pin used only for the schematic demo map. Generated as an
   * offset from the campus-area pin — never a real property address.
   */
  coords: LatLng;
  location: PropertyLocation;
  amenities: AmenityId[];
  /** Free-text amenities entered by a landlord (shown as text, not icons). */
  customAmenities?: string[];
  houseRules: HouseRule[];
  occupancy: OccupancyInfo;
  description: string[];
  availability: Availability;
  owner: PropertyOwner;
  /** Owning account. Seed rows all belong to the single demo landlord portfolio. */
  landlordId: string;
  contact: PropertyContact;
  nearbyLandmarks: NearbyLandmark[];
  /** Demo "verification" state — clearly badged as sample data in the UI. */
  verification: "verified-demo" | "pending-demo";
  tags: string[];
  /** Structured room configurations. At least one is required to publish. */
  rooms: RoomConfiguration[];
  acceptsEnquiries: boolean;
  acceptsBookings: boolean;
  checkInTime: string;
  checkOutTime: string;
  listingStatus: ListingStatus;
  source: "seed" | "landlord-demo";
  isDemo: boolean;
  createdAt: string;
}

/** Demo enquiry/booking request record (never sent to a server). */
export interface BookingRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  area: string;
  universityId: string;
  period: RentalPeriodId;
  requestedAtLabel: string;
  moveInLabel: string;
  status: "pending" | "reviewing" | "accepted" | "declined";
  statusNote: string;
  isDemo: true;
}
