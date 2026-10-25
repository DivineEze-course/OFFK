import type {
  AccommodationTypeId,
  AmenityId,
  BathroomArrangement,
  FurnishingLevel,
  HouseRule,
  PricingBasis,
  Property,
  RentalPricing,
  RoomCapacity,
  RoomConfiguration,
  RoomGradeId,
  RoomPrice,
} from "../types/property";
import type { LatLng, RentalPeriodId } from "../types/university";
import { priceForPeriod } from "../lib/pricing";
import { roomLabel } from "../lib/rooms";
import { getUniversity } from "./universities";
import { commonPhotos, coverPhoto, roomPhotosFor } from "./stock-photos";

/**
 * DEMO DATA — every listing below is fictional sample data for the OFFK
 * template. Names, prices, availability, verification states, landlords and
 * pins are invented. Nothing here has been verified against the real world.
 *
 * Property pins are illustrative offsets from each campus-area pin (see
 * `offsetFrom`), chosen so the schematic map has a believable spread. They are
 * NOT real addresses and must not be presented as such.
 */

/** Moves a point `distanceKm` away from `base` along `bearingDeg` (spherical). */
function offsetFrom(base: LatLng, distanceKm: number, bearingDeg: number): LatLng {
  const angular = distanceKm / 6371.0088;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (base.lat * Math.PI) / 180;
  const lng1 = (base.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    lat: Math.round((lat2 * 180) / Math.PI * 100000) / 100000,
    lng: Math.round((lng2 * 180) / Math.PI * 100000) / 100000,
  };
}

/** House-rule template keys; properties override any subset with their own text. */
type RuleKey = "visitors" | "curfew" | "noise" | "smoking" | "pets" | "utilities" | "occupancy" | "deposit";

const DEFAULT_RULES: Record<RuleKey, HouseRule> = {
  visitors: {
    id: "visitors",
    label: "Visitors",
    description: "Daytime visitors to shared areas are fine; overnight guests need the owner's prior approval. Sample rule — confirm with the property owner.",
  },
  curfew: {
    id: "curfew",
    label: "Gate & curfew",
    description: "The compound gate closes at 11pm and residents keep a gate code. Sample rule — confirm with the property owner.",
  },
  noise: {
    id: "noise",
    label: "Noise",
    description: "Quiet hours from 10pm to 6am on weekdays. Sample rule — confirm with the property owner.",
  },
  smoking: {
    id: "smoking",
    label: "Smoking",
    description: "No smoking indoors; designated outdoor areas only. Sample rule — confirm with the property owner.",
  },
  pets: {
    id: "pets",
    label: "Pets",
    description: "No pets in this demo listing. Sample rule — confirm with the property owner.",
  },
  utilities: {
    id: "utilities",
    label: "Utilities",
    description: "Electricity is metered and split among residents; water is covered by the rent in this demo listing. Sample rule — confirm with the property owner.",
  },
  occupancy: {
    id: "occupancy",
    label: "Occupancy",
    description: "Only the residents named on the tenancy may move in. Sample rule — confirm with the property owner.",
  },
  deposit: {
    id: "deposit",
    label: "Deposit & cancellation",
    description: "One-month refundable deposit, subject to inspection. Sample terms — confirm with the property owner.",
  },
};

function rules(overrides: Partial<Record<RuleKey, string>>, order: RuleKey[]): HouseRule[] {
  return order.map((key) => {
    const base = DEFAULT_RULES[key];
    const description = overrides[key];
    return description ? { ...base, description } : base;
  });
}

function img(propertyId: string, n: number, alt: string) {
  return { src: `/images/properties/${propertyId}-${n}.svg`, alt };
}

/**
 * Structured room plan used to build the demo room records. Every plan is
 * reduced to one of the six supported capacities; no free-text capacity exists.
 */
interface DemoRoomPlan {
  capacity: RoomCapacity;
  grade: RoomGradeId;
  basis: PricingBasis;
  totalRooms: number;
  availableBeds: number;
  availableRooms?: number;
  bathroom: BathroomArrangement;
  bedConfiguration: string;
  furnishing?: FurnishingLevel;
  amenities?: AmenityId[];
  description?: string;
  /** Multiplies the property's base-period price. */
  priceFactor?: number;
  /**
   * For per-person plans, an optional adjustment to the whole-room total.
   * Lets the demo show a total that is not simply per-person × capacity.
   */
  totalFactor?: number;
  /** Add the listing's explicit full-session price to this room. */
  includeSessionOverride?: boolean;
}

const DEMO_LANDLORD_ID = "demo-landlord-1";

const ROOM_PLANS: Record<string, DemoRoomPlan[]> = {
  "abi-jabi-garden-court": [
    {
      capacity: 2,
      grade: "standard",
      basis: "per-person",
      totalRooms: 4,
      availableBeds: 1,
      bathroom: "shared",
      bedConfiguration: "2 single beds · wardrobes and desks",
      amenities: ["desk", "wardrobe", "reading-lamp", "fan", "locker", "shared-bathroom"],
      description:
        "A two-bed room with a desk and wardrobe for each resident. One bed space is vacant in this sample.",
    },
    {
      capacity: 1,
      grade: "premium",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 1,
      bathroom: "shared",
      bedConfiguration: "1 double bed · private use of the room",
      amenities: ["desk", "wardrobe", "reading-lamp", "fan", "shared-bathroom"],
      priceFactor: 1.45,
      description:
        "The same room let for private single occupancy at a premium. The shared kitchen and lounge are unchanged.",
    },
  ],
  "abi-jabi-roof-studio": [
    {
      capacity: 1,
      grade: "standard",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 1,
      bathroom: "private",
      bedConfiguration: "1 double bed in a self-contained studio",
      amenities: ["desk", "wardrobe", "reading-lamp", "air-conditioning", "private-bathroom", "kitchen", "balcony"],
      includeSessionOverride: true,
    },
    {
      capacity: 2,
      grade: "deluxe",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "private",
      bedConfiguration: "1 double bed · suitable for a couple",
      amenities: ["desk", "wardrobe", "air-conditioning", "private-bathroom", "kitchen", "balcony"],
      priceFactor: 1.2,
      description:
        "The studio configured for two occupants. It is fully booked in this sample; the single-occupancy configuration is available.",
    },
  ],
  "abi-wuye-shared-loft": [
    {
      capacity: 4,
      grade: "standard",
      basis: "per-person",
      totalRooms: 2,
      availableBeds: 2,
      bathroom: "shared",
      bedConfiguration: "2 bunk beds · 4 single bed spaces",
      amenities: ["desk", "wardrobe", "reading-lamp", "locker", "fan", "shared-bathroom", "common-room"],
      totalFactor: 0.97,
      description:
        "Four bed spaces across two bunk sets, with personal lockers and a shared study loft. The total room price is listed separately from the per-person rate.",
    },
    {
      capacity: 2,
      grade: "executive",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 1,
      bathroom: "shared",
      bedConfiguration: "2 single beds · private room",
      amenities: ["desk", "wardrobe", "reading-lamp", "fan", "shared-bathroom"],
      priceFactor: 1.8,
      description:
        "A quieter two-bed room in the same loft, let as a whole room. Per-person pricing is not listed for this configuration.",
    },
    {
      capacity: 1,
      grade: "ensuite",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "private",
      bedConfiguration: "1 single bed · en-suite",
      amenities: ["desk", "wardrobe", "reading-lamp", "fan", "private-bathroom"],
      priceFactor: 1.1,
      description: "A single en-suite room. Fully booked in this sample.",
    },
    {
      capacity: 3,
      grade: "deluxe",
      basis: "per-person",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "shared",
      bedConfiguration: "1 bunk bed + 1 single bed · 3 bed spaces",
      amenities: ["desk", "locker", "fan", "shared-bathroom"],
      priceFactor: 1.05,
    },
    {
      capacity: 5,
      grade: "premium",
      basis: "per-person",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "shared",
      bedConfiguration: "2 bunk beds + 1 single bed · 5 bed spaces",
      amenities: ["desk", "locker", "fan", "shared-bathroom"],
      priceFactor: 0.98,
    },
    {
      capacity: 6,
      grade: "special",
      basis: "per-person",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "shared",
      bedConfiguration: "3 bunk beds · 6 bed spaces",
      amenities: ["desk", "locker", "fan", "shared-bathroom"],
      priceFactor: 0.94,
    },
  ],
  "abi-karu-private-room": [
    {
      capacity: 1,
      grade: "standard",
      basis: "per-room",
      totalRooms: 3,
      availableBeds: 2,
      bathroom: "shared",
      bedConfiguration: "1 double bed · private room",
      amenities: ["desk", "wardrobe", "reading-lamp", "fan", "shared-bathroom"],
    },
    {
      capacity: 2,
      grade: "premium",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "shared",
      bedConfiguration: "2 single beds · private use",
      amenities: ["desk", "wardrobe", "fan", "shared-bathroom"],
      priceFactor: 1.4,
    },
  ],
  "abi-katampe-one-bed": [
    {
      capacity: 2,
      grade: "standard",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 1,
      bathroom: "private",
      bedConfiguration: "1 double bed · whole flat",
      amenities: ["desk", "wardrobe", "air-conditioning", "private-bathroom", "kitchen", "balcony"],
      includeSessionOverride: true,
      description:
        "The whole one-bedroom flat, quoted per room for up to two occupants. Utilities are not included.",
    },
    {
      capacity: 1,
      grade: "premium",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "private",
      bedConfiguration: "1 double bed · single occupancy of the whole flat",
      amenities: ["desk", "wardrobe", "air-conditioning", "private-bathroom", "kitchen"],
      priceFactor: 0.85,
      description:
        "Single-occupancy use of the same flat. The flat is currently held for the two-person configuration in this sample.",
    },
  ],
  "abi-life-camp-suite": [
    {
      capacity: 2,
      grade: "deluxe",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "private",
      bedConfiguration: "1 king bed · studio suite",
      amenities: ["desk", "wardrobe", "air-conditioning", "private-bathroom", "kitchen", "balcony"],
      description: "The studio suite as listed. Waitlisted in this sample.",
    },
    {
      capacity: 1,
      grade: "executive",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "private",
      bedConfiguration: "1 king bed · single occupancy",
      amenities: ["desk", "wardrobe", "air-conditioning", "private-bathroom", "kitchen"],
      priceFactor: 0.9,
    },
  ],
  "abi-gwarinpa-shared": [
    {
      capacity: 2,
      grade: "standard",
      basis: "per-room",
      totalRooms: 2,
      availableBeds: 1,
      bathroom: "shared",
      bedConfiguration: "2 single beds · private room in a shared flat",
      amenities: ["desk", "wardrobe", "fan", "shared-bathroom", "kitchen"],
    },
    {
      capacity: 1,
      grade: "premium",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "shared",
      bedConfiguration: "1 single bed · private use of the room",
      amenities: ["desk", "wardrobe", "fan", "shared-bathroom"],
      priceFactor: 0.8,
    },
  ],
  "bze-baze-road-studio": [
    {
      capacity: 1,
      grade: "standard",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 1,
      bathroom: "private",
      bedConfiguration: "1 double bed · self-contained studio",
      amenities: ["desk", "wardrobe", "reading-lamp", "fan", "private-bathroom", "kitchen"],
      includeSessionOverride: true,
    },
    {
      capacity: 2,
      grade: "deluxe",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "private",
      bedConfiguration: "1 double bed · two occupants",
      amenities: ["desk", "wardrobe", "fan", "private-bathroom", "kitchen"],
      priceFactor: 1.15,
    },
  ],
  "bze-kuje-family-flat": [
    {
      capacity: 2,
      grade: "standard",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 1,
      bathroom: "private",
      bedConfiguration: "1 double bed · whole flat",
      amenities: ["desk", "wardrobe", "private-bathroom", "kitchen", "balcony"],
    },
    {
      capacity: 1,
      grade: "premium",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "private",
      bedConfiguration: "1 double bed · single occupancy",
      amenities: ["desk", "wardrobe", "private-bathroom", "kitchen"],
      priceFactor: 0.8,
    },
    {
      capacity: 3,
      grade: "special",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "private",
      bedConfiguration: "1 double bed + 1 single bed · whole flat",
      amenities: ["desk", "wardrobe", "private-bathroom", "kitchen"],
      priceFactor: 1.35,
    },
  ],
  "bze-gudu-shared-house": [
    {
      capacity: 6,
      grade: "standard",
      basis: "per-person",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "shared",
      bedConfiguration: "3 bunk beds · 6 bed spaces",
      amenities: ["desk", "locker", "fan", "shared-bathroom", "study-area"],
      description: "The main six-bed room. Fully booked in this sample.",
    },
    {
      capacity: 4,
      grade: "premium",
      basis: "per-person",
      totalRooms: 1,
      availableBeds: 1,
      bathroom: "shared",
      bedConfiguration: "2 bunk beds · 4 bed spaces",
      amenities: ["desk", "locker", "fan", "shared-bathroom"],
      priceFactor: 1.15,
      description:
        "A four-bed room with one vacant space. Capacity remains four; availability is one space.",
    },
    {
      capacity: 2,
      grade: "executive",
      basis: "per-person",
      totalRooms: 2,
      availableBeds: 2,
      bathroom: "shared",
      bedConfiguration: "2 single beds · twin room",
      amenities: ["desk", "wardrobe", "fan", "shared-bathroom"],
      priceFactor: 1.35,
    },
    {
      capacity: 1,
      grade: "ensuite",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 1,
      bathroom: "private",
      bedConfiguration: "1 single bed · en-suite",
      amenities: ["desk", "wardrobe", "reading-lamp", "private-bathroom"],
      priceFactor: 1.6,
    },
    {
      capacity: 3,
      grade: "deluxe",
      basis: "per-person",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "shared",
      bedConfiguration: "1 bunk bed + 1 single bed · 3 bed spaces",
      amenities: ["desk", "locker", "fan", "shared-bathroom"],
      priceFactor: 1.1,
    },
    {
      capacity: 5,
      grade: "special",
      basis: "per-person",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "shared",
      bedConfiguration: "2 bunk beds + 1 single bed · 5 bed spaces",
      amenities: ["desk", "locker", "fan", "shared-bathroom"],
      priceFactor: 1.02,
    },
  ],
  "bze-apo-two-bed": [
    {
      capacity: 4,
      grade: "premium",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 1,
      bathroom: "private",
      bedConfiguration: "2 double bedrooms · whole flat",
      amenities: ["desk", "wardrobe", "air-conditioning", "private-bathroom", "kitchen", "balcony"],
      includeSessionOverride: true,
    },
    {
      capacity: 2,
      grade: "standard",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "private",
      bedConfiguration: "1 bedroom · whole flat",
      amenities: ["desk", "wardrobe", "private-bathroom", "kitchen"],
      priceFactor: 0.7,
    },
    {
      capacity: 3,
      grade: "deluxe",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "private",
      bedConfiguration: "2 bedrooms · 3 occupants",
      amenities: ["desk", "wardrobe", "private-bathroom", "kitchen"],
      priceFactor: 0.9,
    },
  ],
  "bze-jabi-annex": [
    {
      capacity: 1,
      grade: "standard",
      basis: "per-room",
      totalRooms: 2,
      availableBeds: 1,
      bathroom: "shared",
      bedConfiguration: "1 double bed · private room",
      amenities: ["desk", "wardrobe", "reading-lamp", "shared-bathroom", "study-area"],
    },
    {
      capacity: 2,
      grade: "premium",
      basis: "per-room",
      totalRooms: 1,
      availableBeds: 0,
      bathroom: "shared",
      bedConfiguration: "2 single beds · private room",
      amenities: ["desk", "wardrobe", "shared-bathroom", "study-area"],
      priceFactor: 1.55,
    },
  ],
};

function basePeriodAmount(
  pricing: RentalPricing,
  period: Exclude<RentalPeriodId, "session">,
): number | undefined {
  return period === "semester" ? pricing.semesterPrice : pricing.trimesterPrice;
}

function scheduleFor(basis: PricingBasis): string[] {
  return [
    basis === "per-room"
      ? "Deposit on acceptance (demo)"
      : "Your share of the deposit on acceptance (demo)",
    "Balance before move-in (demo)",
  ];
}

function buildRoomPrices(
  pricing: RentalPricing,
  plan: DemoRoomPlan,
): RoomPrice[] {
  const factor = plan.priceFactor ?? 1;
  const prices: RoomPrice[] = [];

  for (const period of ["semester", "trimester"] as const) {
    const base = basePeriodAmount(pricing, period);
    if (base == null) continue;

    const perPersonAmount =
      plan.basis === "per-person" ? Math.round(base * factor) : undefined;
    const totalAmount =
      plan.basis === "per-person"
        ? Math.round((perPersonAmount ?? 0) * plan.capacity * (plan.totalFactor ?? 1))
        : Math.round(base * factor);

    const depositBasis =
      plan.basis === "per-person" ? (perPersonAmount ?? 0) : totalAmount;

    prices.push({
      period,
      totalAmount,
      perPersonAmount,
      basis: plan.basis,
      currency: "NGN",
      depositAmount: Math.round(depositBasis * 0.15),
      refundableDeposit: true,
      serviceCharge: 0,
      utilityCharge: null,
      utilityNote: "Utilities are usage-based in this demo listing.",
      paymentSchedule: scheduleFor(plan.basis),
      note:
        plan.basis === "per-person"
          ? "Demo per-person quote. The whole-room total is listed separately and occupants are not assumed to split it equally."
          : "Demo whole-room quote. No per-person split is listed for this configuration.",
      isSample: true,
    });
  }

  if (plan.includeSessionOverride && pricing.sessionPrice != null && plan.basis === "per-room") {
    prices.push({
      period: "session",
      totalAmount: pricing.sessionPrice,
      basis: "per-room",
      currency: "NGN",
      depositAmount: Math.round(pricing.sessionPrice * 0.15),
      refundableDeposit: true,
      serviceCharge: 0,
      utilityCharge: null,
      utilityNote: "Utilities are usage-based in this demo listing.",
      paymentSchedule: scheduleFor("per-room"),
      note: "Landlord-listed full-session rate. Demo amount only.",
      isSample: true,
    });
  }

  return prices;
}

function buildRooms(
  propertyId: string,
  pricing: RentalPricing,
  plans: DemoRoomPlan[],
): RoomConfiguration[] {
  return plans.map((plan, index) => {
    const availableRooms =
      plan.availableRooms ??
      (plan.availableBeds === 0
        ? 0
        : Math.min(plan.totalRooms, Math.ceil(plan.availableBeds / plan.capacity)));

    return {
      id: `${propertyId}-room-${index + 1}`,
      capacity: plan.capacity,
      grade: plan.grade,
      name: roomLabel(plan.capacity, plan.grade),
      maxOccupancy: plan.capacity,
      bedConfiguration: plan.bedConfiguration,
      bathroom: plan.bathroom,
      bathroomNote:
        plan.bathroom === "private"
          ? "Private bathroom inside this room type (demo claim)."
          : plan.bathroom === "shared"
            ? "Bathroom shared with other rooms (demo claim)."
            : "The landlord has not specified the bathroom arrangement.",
      furnishing: plan.furnishing ?? "furnished",
      amenities: plan.amenities ?? [],
      description:
        plan.description ??
        `${roomLabel(plan.capacity, plan.grade)} with ${plan.bedConfiguration.toLowerCase()}. Demo room configuration — photos are illustrative stock images.`,
      photos: roomPhotosFor(plan.capacity),
      prices: buildRoomPrices(pricing, plan),
      availability: {
        totalRooms: plan.totalRooms,
        availableRooms,
        availableBeds: plan.availableBeds,
        note: "Sample availability — the app does not reserve or reduce rooms when you send an enquiry.",
        isSample: true,
      },
      isSample: true,
    };
  });
}

interface DemoListingInput {
  id: string;
  title: string;
  area: string;
  universityIds: string[];
  type: AccommodationTypeId;
  furnishing: FurnishingLevel;
  pricing: RentalPricing;
  /** Illustrative straight-line offset from the primary campus pin. */
  pinFrom: { universityId: string; km: number; bearing: number };
  images: Array<[number, string]>;
  amenities: Property["amenities"];
  occupancy: Property["occupancy"];
  description: string[];
  availability: Property["availability"];
  owner: Property["owner"];
  nearbyLandmarks: Property["nearbyLandmarks"];
  verification: Property["verification"];
  tags: string[];
  ruleOrder: RuleKey[];
  ruleOverrides?: Partial<Record<RuleKey, string>>;
}

function buildListing(input: DemoListingInput, index: number): Property {
  const primaryUniversity = getUniversity(input.universityIds[0]);
  const coords = offsetFrom(primaryUniversity.coords, input.pinFrom.km, input.pinFrom.bearing);
  const plans = ROOM_PLANS[input.id] ?? [];
  if (plans.length === 0) {
    throw new Error(`[demo data] Listing "${input.id}" has no structured room plan`);
  }

  return {
    id: input.id,
    title: input.title,
    area: input.area,
    universityIds: input.universityIds,
    type: input.type,
    furnishing: input.furnishing,
    pricing: input.pricing,
    images: [
      coverPhoto(index),
      ...commonPhotos(true),
      ...input.images.map(([n, alt]) => img(input.id, n, alt)),
    ],
    coords,
    location: {
      coords,
      verification: "demo-unverified",
      note: "Illustrative demo pin, not a surveyed address. Google Places verification is required for a real listing.",
    },
    amenities: input.amenities,
    houseRules: rules(input.ruleOverrides ?? {}, input.ruleOrder),
    occupancy: input.occupancy,
    description: input.description,
    availability: input.availability,
    owner: input.owner,
    landlordId: DEMO_LANDLORD_ID,
    contact: {
      name: input.owner.name,
      role: input.owner.role,
      email: "landlord.demo@offk.example",
      phoneDisplay: "Demo contact details hidden",
      isDemo: true,
    },
    nearbyLandmarks: input.nearbyLandmarks,
    verification: input.verification,
    tags: input.tags,
    rooms: buildRooms(input.id, input.pricing, plans),
    acceptsEnquiries: true,
    acceptsBookings: true,
    checkInTime: "12:00 (demo)",
    checkOutTime: "10:00 (demo)",
    listingStatus: "published",
    source: "seed",
    isDemo: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

const LISTINGS: DemoListingInput[] = [
  {
    id: "abi-jabi-garden-court",
    title: "Garden Court Shared Room (2 beds)",
    area: "Jabi",
    universityIds: ["nile"],
    type: "shared-room",
    furnishing: "furnished",
    pricing: { currency: "NGN", semesterPrice: 280_000 },
    pinFrom: { universityId: "nile", km: 2.6, bearing: 315 },
    images: [
      [1, "Illustration: exterior of a three-storey apartment block with a gated compound (demo image for Garden Court)"],
      [2, "Illustration: furnished shared bedroom with two beds, a study desk and a bright window (demo image)"],
      [3, "Illustration: shared kitchen with wooden cabinets and a tiled backsplash (demo image)"],
      [4, "Illustration: shared lounge with a green sofa and indoor plants (demo image)"],
    ],
    amenities: ["wifi", "power", "generator", "water", "furnished", "shared-bathroom", "security", "parking", "laundry", "study-area"],
    occupancy: {
      description: "Two single beds in one air-cross ventilated room, each with its own wardrobe and study desk.",
      maxOccupants: 2,
      bathrooms: 1,
      bedrooms: 1,
      sizeNote: "Approx. 18 m² shared room (sample figure)",
    },
    description: [
      "A bright two-bed shared room in a quiet gated compound a short bike ride from the Nile University demo pin. This sample listing shows what a budget-friendly, well-kept shared room can look like on OFFK.",
      "Both beds come with wardrobes, study desks and reading lights. The kitchen and bathroom are shared with the other two residents of the unit.",
    ],
    availability: { status: "limited", label: "Limited — 1 spot left", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-1", name: "A. Musa (demo)", role: "Property owner", joinedLabel: "Joined 2024 (sample)", responseNote: "Usually replies within a day (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Jabi Lake area", note: "Sample landmark reference — not a measured distance." },
      { name: "Community market", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "verified-demo",
    tags: ["Budget pick", "Popular"],
    ruleOrder: ["visitors", "noise", "smoking", "pets", "utilities", "occupancy", "deposit"],
    ruleOverrides: {
      utilities: "Electricity is metered and split between the two residents; water is covered by the rent. Sample rule — confirm with the property owner.",
    },
  },
  {
    id: "abi-jabi-roof-studio",
    title: "Sunlit Roof-Top Studio",
    area: "Jabi",
    universityIds: ["nile", "baze"],
    type: "studio",
    furnishing: "furnished",
    pricing: { currency: "NGN", semesterPrice: 850_000, trimesterPrice: 520_000, sessionPrice: 1_480_000 },
    pinFrom: { universityId: "nile", km: 3.1, bearing: 300 },
    images: [
      [1, "Illustration: self-contained studio with a double bed and kitchenette (demo image for Roof-Top Studio)"],
      [2, "Illustration: compact kitchen with counters, sink and overhead cabinets (demo image)"],
      [3, "Illustration: balcony with railing chairs and a view over trees (demo image)"],
      [4, "Illustration: bathroom with glass shower, mirror and tiled walls (demo image)"],
    ],
    amenities: ["wifi", "power", "generator", "water", "furnished", "kitchen", "private-bathroom", "security", "cctv", "parking", "air-conditioning", "laundry"],
    occupancy: {
      description: "One double bed, kitchenette and en-suite bathroom in a top-floor unit with a private balcony.",
      maxOccupants: 2,
      bathrooms: 1,
      bedrooms: 1,
      sizeNote: "Approx. 32 m² studio (sample figure)",
    },
    description: [
      "A self-contained top-floor studio between the Nile and Baze demo pins, shown here to demonstrate OFFK's cross-university pricing: the same listing is priced per semester for Nile students and per trimester for Baze students.",
      "The explicit session price in this demo listing is lower than the sum of its periods — a realistic case where a landlord offers a discount for paying the whole session up front.",
    ],
    availability: { status: "available", label: "Available", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-2", name: "F. Adeyemi (demo)", role: "Property manager", joinedLabel: "Joined 2023 (sample)", responseNote: "Usually replies within a few hours (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Jabi shopping area", note: "Sample landmark reference — not a measured distance." },
      { name: "Main road transit stop", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "verified-demo",
    tags: ["Cross-campus", "Self-contained"],
    ruleOrder: ["visitors", "curfew", "noise", "smoking", "pets", "utilities", "occupancy", "deposit"],
  },
  {
    id: "abi-wuye-shared-loft",
    title: "Wuye Shared Loft (4 beds)",
    area: "Wuye",
    universityIds: ["nile", "baze"],
    type: "shared-room",
    furnishing: "semi-furnished",
    pricing: { currency: "NGN", semesterPrice: 310_000, trimesterPrice: 195_000 },
    pinFrom: { universityId: "nile", km: 4.1, bearing: 285 },
    images: [
      [1, "Illustration: shared loft room with bunk beds and lockers (demo image for Wuye Loft)"],
      [2, "Illustration: study corner with desk, chair and shelf (demo image)"],
      [3, "Illustration: communal lounge with armchairs and bookshelves (demo image)"],
      [4, "Illustration: exterior of the demo apartment block with trees (demo image)"],
    ],
    amenities: ["wifi", "power", "generator", "water", "shared-bathroom", "security", "parking", "study-area", "laundry"],
    occupancy: {
      description: "Four single beds (two bunk sets), personal lockers and a shared study loft.",
      maxOccupants: 4,
      bathrooms: 2,
      bedrooms: 1,
      sizeNote: "Approx. 40 m² shared loft (sample figure)",
    },
    description: [
      "A four-bed shared loft popular with final-year students in this demo dataset. The compound has a quiet study loft and a communal lounge.",
      "This sample listing intentionally has no session price — switch to 'Full academic session' to see how OFFK handles a listing that only quotes per-period rates.",
    ],
    availability: { status: "limited", label: "Limited — 2 spots left", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-3", name: "I. Danjuma (demo)", role: "Property owner", joinedLabel: "Joined 2025 (sample)", responseNote: "Usually replies within two days (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Wuye district shops", note: "Sample landmark reference — not a measured distance." },
      { name: "Neighbourhood clinic", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "pending-demo",
    tags: ["Budget pick"],
    ruleOrder: ["visitors", "curfew", "noise", "smoking", "utilities", "occupancy", "deposit"],
    ruleOverrides: {
      curfew: "The compound gate closes at 10:30pm on weekdays and midnight on weekends. Sample rule — confirm with the property owner.",
    },
  },
  {
    id: "abi-karu-private-room",
    title: "Karu Private Room with Balcony",
    area: "Karu",
    universityIds: ["nile"],
    type: "private-room",
    furnishing: "semi-furnished",
    pricing: { currency: "NGN", semesterPrice: 420_000 },
    pinFrom: { universityId: "nile", km: 5.2, bearing: 60 },
    images: [
      [1, "Illustration: private bedroom with double bed and framed art (demo image for Karu Room)"],
      [2, "Illustration: hallway with wooden doors leading to private rooms (demo image)"],
      [3, "Illustration: shared bathroom with tiled walls and glass shower (demo image)"],
      [4, "Illustration: shared lounge with armchairs and a bookshelf (demo image)"],
    ],
    amenities: ["power", "generator", "water", "shared-bathroom", "security", "parking", "laundry", "study-area"],
    occupancy: {
      description: "One private bedroom in a four-room flat; lounge and kitchen shared with three other tenants.",
      maxOccupants: 1,
      bathrooms: 1,
      bedrooms: 1,
      sizeNote: "Approx. 14 m² private room (sample figure)",
    },
    description: [
      "A private room in a calm four-room flat, shown here as the middle ground between a shared room and a studio. Semi-furnished: bed and wardrobe included, bring your own mattress topper and desk accessories.",
      "The balcony is shared with the flat and looks onto the compound garden.",
    ],
    availability: { status: "available", label: "Available", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-4", name: "B. Okafor (demo)", role: "Property owner", joinedLabel: "Joined 2024 (sample)", responseNote: "Usually replies within a day (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Karu market area", note: "Sample landmark reference — not a measured distance." },
      { name: "Estate bus stop", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "verified-demo",
    tags: ["Private room"],
    ruleOrder: ["visitors", "noise", "smoking", "pets", "utilities", "occupancy", "deposit"],
  },
  {
    id: "abi-katampe-one-bed",
    title: "Katampe One-Bedroom Flat",
    area: "Katampe",
    universityIds: ["nile"],
    type: "one-bedroom",
    furnishing: "furnished",
    pricing: { currency: "NGN", semesterPrice: 1_150_000, sessionPrice: 2_150_000 },
    pinFrom: { universityId: "nile", km: 3.4, bearing: 20 },
    images: [
      [1, "Illustration: living room with sofa coffee table and plants (demo image for Katampe Flat)"],
      [2, "Illustration: fitted kitchen with stove kettle and cabinets (demo image)"],
      [3, "Illustration: furnished bedroom with double bed and side lamps (demo image)"],
      [4, "Illustration: exterior of a modern apartment block (demo image)"],
    ],
    amenities: ["wifi", "power", "generator", "water", "borehole", "furnished", "kitchen", "private-bathroom", "security", "cctv", "parking", "laundry", "air-conditioning"],
    occupancy: {
      description: "One bedroom, one bathroom, a full lounge and a fitted kitchen — ideal for a solo student or a couple.",
      maxOccupants: 2,
      bathrooms: 1,
      bedrooms: 1,
      sizeNote: "Approx. 55 m² flat (sample figure)",
    },
    description: [
      "A fully furnished one-bedroom flat in a quiet Katampe street in this demo dataset. Comes with air conditioning, a borehole and a standby generator.",
      "The explicit session price demonstrates a landlord-set rate that differs from the standard '2 × semester' demo formula.",
    ],
    availability: { status: "available", label: "Available", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-5", name: "C. Nwosu (demo)", role: "Property manager", joinedLabel: "Joined 2022 (sample)", responseNote: "Usually replies within a few hours (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Katampe hillside park", note: "Sample landmark reference — not a measured distance." },
      { name: "Neighbourhood supermarket", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "verified-demo",
    tags: ["Premium", "Furnished"],
    ruleOrder: ["visitors", "noise", "smoking", "pets", "utilities", "occupancy", "deposit"],
  },
  {
    id: "abi-life-camp-suite",
    title: "Life Camp Executive Studio",
    area: "Life Camp",
    universityIds: ["nile"],
    type: "studio",
    furnishing: "furnished",
    pricing: { currency: "NGN", semesterPrice: 980_000 },
    pinFrom: { universityId: "nile", km: 6.8, bearing: 340 },
    images: [
      [1, "Illustration: executive studio with double bed and kitchenette (demo image for Life Camp Suite)"],
      [2, "Illustration: bathroom with glass shower and round mirror (demo image)"],
      [3, "Illustration: balcony with chairs and skyline view (demo image)"],
      [4, "Illustration: study corner with desk lamp and shelves (demo image)"],
    ],
    amenities: ["wifi", "power", "generator", "water", "borehole", "furnished", "kitchen", "private-bathroom", "security", "cctv", "parking", "laundry", "air-conditioning", "study-area"],
    occupancy: {
      description: "Studio suite with a king bed, kitchenette, en-suite bathroom and a private work nook.",
      maxOccupants: 2,
      bathrooms: 1,
      bedrooms: 1,
      sizeNote: "Approx. 38 m² suite (sample figure)",
    },
    description: [
      "The premium end of this demo dataset: a serviced studio with a dedicated work nook, aimed at students who want a quiet, self-contained base.",
      "Currently waitlisted in this sample — join the waitlist demo to see how OFFK surfaces request states on the dashboard.",
    ],
    availability: { status: "waitlist", label: "Waitlist", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-6", name: "T. Bello (demo)", role: "Property manager", joinedLabel: "Joined 2021 (sample)", responseNote: "Usually replies within a day (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Life Camp garden estate", note: "Sample landmark reference — not a measured distance." },
      { name: "Transit hub", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "verified-demo",
    tags: ["Premium", "New"],
    ruleOrder: ["visitors", "noise", "smoking", "pets", "utilities", "occupancy", "deposit"],
  },
  {
    id: "abi-gwarinpa-shared",
    title: "Gwarinpa Shared Apartment",
    area: "Gwarinpa",
    universityIds: ["nile"],
    type: "shared-apartment",
    furnishing: "semi-furnished",
    pricing: { currency: "NGN", semesterPrice: 560_000 },
    pinFrom: { universityId: "nile", km: 8.2, bearing: 350 },
    images: [
      [1, "Illustration: shared apartment lounge with sofa and coffee table (demo image for Gwarinpa Flat)"],
      [2, "Illustration: shared kitchen with tiled backsplash (demo image)"],
      [3, "Illustration: shared bedroom with two beds and lockers (demo image)"],
      [4, "Illustration: compound exterior with trees and parking (demo image)"],
    ],
    amenities: ["power", "generator", "water", "kitchen", "shared-bathroom", "security", "parking", "laundry"],
    occupancy: {
      description: "Private room in a two-bedroom flat shared with one other student; lounge and kitchen shared.",
      maxOccupants: 2,
      bathrooms: 1,
      bedrooms: 2,
      sizeNote: "Approx. 22 m² private room (sample figure)",
    },
    description: [
      "A value-for-money shared apartment in a busy Gwarinpa district, included to show the trade-off between cost and commute in this demo dataset.",
      "Semi-furnished: wardrobes and beds included; bring your own appliances.",
    ],
    availability: { status: "available", label: "Available", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-7", name: "H. Suleiman (demo)", role: "Property owner", joinedLabel: "Joined 2023 (sample)", responseNote: "Usually replies within two days (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Gwarinpa district shops", note: "Sample landmark reference — not a measured distance." },
      { name: "Recreation park", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "pending-demo",
    tags: ["Value commute"],
    ruleOrder: ["visitors", "noise", "smoking", "utilities", "occupancy", "deposit"],
  },
  {
    id: "bze-baze-road-studio",
    title: "Gudu Self-Contain Studio",
    area: "Gudu",
    universityIds: ["baze"],
    type: "studio",
    furnishing: "furnished",
    pricing: { currency: "NGN", trimesterPrice: 310_000, sessionPrice: 880_000 },
    pinFrom: { universityId: "baze", km: 2.1, bearing: 210 },
    images: [
      [1, "Illustration: self-contained studio with bed and kitchenette (demo image for Gudu Studio)"],
      [2, "Illustration: kitchen counter with stove and kettle (demo image)"],
      [3, "Illustration: bathroom with shower and tiled walls (demo image)"],
      [4, "Illustration: exterior of the demo studio block (demo image)"],
    ],
    amenities: ["wifi", "power", "generator", "water", "furnished", "kitchen", "private-bathroom", "security", "parking", "laundry"],
    occupancy: {
      description: "Compact self-contained studio with a double bed, kitchenette and en-suite bathroom.",
      maxOccupants: 1,
      bathrooms: 1,
      bedrooms: 1,
      sizeNote: "Approx. 24 m² studio (sample figure)",
    },
    description: [
      "A compact, furnished self-contain in this Baze-side demo dataset. Priced per trimester with an explicit session price that undercuts 3 × trimester — the demo model surfaces that saving automatically.",
      "Closest demo listing to the Baze University campus-area pin.",
    ],
    availability: { status: "limited", label: "Limited — 1 unit left", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-8", name: "R. Etim (demo)", role: "Property owner", joinedLabel: "Joined 2024 (sample)", responseNote: "Usually replies within a day (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Gudu market", note: "Sample landmark reference — not a measured distance." },
      { name: "Bus stop", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "verified-demo",
    tags: ["Closest to campus", "Self-contained"],
    ruleOrder: ["visitors", "noise", "smoking", "pets", "utilities", "occupancy", "deposit"],
  },
  {
    id: "bze-kuje-family-flat",
    title: "Kuje Garden One-Bedroom",
    area: "Kuje",
    universityIds: ["baze"],
    type: "one-bedroom",
    furnishing: "semi-furnished",
    pricing: { currency: "NGN", trimesterPrice: 380_000 },
    pinFrom: { universityId: "baze", km: 6.5, bearing: 260 },
    images: [
      [1, "Illustration: living room with sofa and framed art (demo image for Kuje Flat)"],
      [2, "Illustration: bedroom with double bed and side table (demo image)"],
      [3, "Illustration: fitted kitchen with stove and cabinets (demo image)"],
      [4, "Illustration: exterior with compound wall and trees (demo image)"],
    ],
    amenities: ["power", "generator", "water", "borehole", "kitchen", "private-bathroom", "security", "parking", "laundry"],
    occupancy: {
      description: "One bedroom, lounge, kitchen and a private bathroom in a fenced garden compound.",
      maxOccupants: 2,
      bathrooms: 1,
      bedrooms: 1,
      sizeNote: "Approx. 48 m² flat (sample figure)",
    },
    description: [
      "A calm, garden-facing one-bedroom flat in this demo dataset — the budget alternative to the Katampe flat on the Nile side.",
      "Semi-furnished with wardrobes and a kitchen island; bring your own lounge furniture.",
    ],
    availability: { status: "available", label: "Available", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-9", name: "M. Abubakar (demo)", role: "Property owner", joinedLabel: "Joined 2022 (sample)", responseNote: "Usually replies within a day (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Kuje town centre", note: "Sample landmark reference — not a measured distance." },
      { name: "Weekend market", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "pending-demo",
    tags: ["Garden compound"],
    ruleOrder: ["visitors", "noise", "smoking", "pets", "utilities", "occupancy", "deposit"],
  },
  {
    id: "bze-gudu-shared-house",
    title: "Gudu Shared Student House (6 beds)",
    area: "Gudu",
    universityIds: ["baze"],
    type: "shared-room",
    furnishing: "semi-furnished",
    pricing: { currency: "NGN", trimesterPrice: 150_000 },
    pinFrom: { universityId: "baze", km: 2.9, bearing: 195 },
    images: [
      [1, "Illustration: shared room with bunk beds and lockers (demo image for Gudu House)"],
      [2, "Illustration: hallway with doors to shared rooms (demo image)"],
      [3, "Illustration: study corner with desk and shelves (demo image)"],
      [4, "Illustration: communal lounge with sofas (demo image)"],
    ],
    amenities: ["power", "generator", "water", "shared-bathroom", "security", "parking", "study-area"],
    occupancy: {
      description: "Six beds across two shared rooms, with lockers, two bathrooms and a communal study area.",
      maxOccupants: 6,
      bathrooms: 2,
      bedrooms: 2,
      sizeNote: "Approx. 20 m² per shared room (sample figure)",
    },
    description: [
      "The most affordable sample listing in this demo dataset: a six-bed shared house a short ride from the Baze campus-area pin.",
      "Fully booked in this sample — saved listings keep it on your radar if availability changes.",
    ],
    availability: { status: "fully-booked", label: "Fully booked", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-10", name: "S. Yakubu (demo)", role: "Property owner", joinedLabel: "Joined 2025 (sample)", responseNote: "Usually replies within two days (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Gudu bus terminal", note: "Sample landmark reference — not a measured distance." },
      { name: "Local shops", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "verified-demo",
    tags: ["Budget pick"],
    ruleOrder: ["visitors", "curfew", "noise", "smoking", "utilities", "occupancy", "deposit"],
    ruleOverrides: {
      utilities: "Electricity is metered and split across all six residents. Sample rule — confirm with the property owner.",
    },
  },
  {
    id: "bze-apo-two-bed",
    title: "Apo Two-Bedroom Premium",
    area: "Apo",
    universityIds: ["baze"],
    type: "two-bedroom",
    furnishing: "furnished",
    pricing: { currency: "NGN", trimesterPrice: 620_000, sessionPrice: 1_750_000 },
    pinFrom: { universityId: "baze", km: 4.8, bearing: 160 },
    images: [
      [1, "Illustration: spacious living room with sofa and coffee table (demo image for Apo Flat)"],
      [2, "Illustration: master bedroom with double bed and lamps (demo image)"],
      [3, "Illustration: balcony with chairs overlooking trees (demo image)"],
      [4, "Illustration: fitted kitchen with island and stove (demo image)"],
    ],
    amenities: ["wifi", "power", "generator", "water", "borehole", "furnished", "kitchen", "private-bathroom", "security", "cctv", "parking", "laundry", "air-conditioning", "study-area"],
    occupancy: {
      description: "Two furnished bedrooms, two bathrooms, a large lounge and a fitted kitchen — suits two students splitting rent.",
      maxOccupants: 4,
      bathrooms: 2,
      bedrooms: 2,
      sizeNote: "Approx. 90 m² flat (sample figure)",
    },
    description: [
      "A premium two-bedroom flat in this demo dataset, often split between two students in the sample narrative.",
      "The landlord-set session price is lower than 3 × trimester in the demo model, and OFFK shows the saving on the listing.",
    ],
    availability: { status: "available", label: "Available", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-11", name: "E. Obi (demo)", role: "Property manager", joinedLabel: "Joined 2021 (sample)", responseNote: "Usually replies within a few hours (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Apo legislative quarters area", note: "Sample landmark reference — not a measured distance." },
      { name: "Shopping plaza", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "verified-demo",
    tags: ["Premium", "Split-friendly"],
    ruleOrder: ["visitors", "noise", "smoking", "pets", "utilities", "occupancy", "deposit"],
  },
  {
    id: "bze-jabi-annex",
    title: "Jabi Study Annex (shared apartment)",
    area: "Jabi",
    universityIds: ["nile", "baze"],
    type: "shared-apartment",
    furnishing: "furnished",
    pricing: { currency: "NGN", semesterPrice: 430_000, trimesterPrice: 265_000 },
    pinFrom: { universityId: "nile", km: 3.8, bearing: 270 },
    images: [
      [1, "Illustration: study annex room with desk chair and shelves (demo image for Jabi Annex)"],
      [2, "Illustration: furnished bedroom with double bed (demo image)"],
      [3, "Illustration: shared bathroom with glass shower (demo image)"],
      [4, "Illustration: balcony with plants and railing view (demo image)"],
    ],
    amenities: ["wifi", "power", "generator", "water", "furnished", "kitchen", "shared-bathroom", "security", "cctv", "parking", "study-area", "laundry"],
    occupancy: {
      description: "Private furnished room in a three-room flat with a dedicated study annex off the lounge.",
      maxOccupants: 1,
      bathrooms: 1,
      bedrooms: 1,
      sizeNote: "Approx. 16 m² private room (sample figure)",
    },
    description: [
      "A furnished private room in a shared flat with a dedicated study annex, positioned between the Nile and Baze demo pins in this sample dataset.",
      "Cross-campus demo listing: switch universities in the header to see the price re-quote under each rental model.",
    ],
    availability: { status: "available", label: "Available", note: "Sample availability for this demo listing.", isSample: true },
    owner: { id: "demo-owner-12", name: "Z. Aliyu (demo)", role: "Property owner", joinedLabel: "Joined 2023 (sample)", responseNote: "Usually replies within a day (sample text)", contactLabel: "Demo contact details hidden", isDemo: true },
    nearbyLandmarks: [
      { name: "Jabi Lake area", note: "Sample landmark reference — not a measured distance." },
      { name: "Arts and crafts market", note: "Sample landmark reference — not a measured distance." },
    ],
    verification: "pending-demo",
    tags: ["Cross-campus", "Study-friendly"],
    ruleOrder: ["visitors", "noise", "smoking", "pets", "utilities", "occupancy", "deposit"],
  },
];

export const PROPERTIES: Property[] = LISTINGS.map(buildListing);

/**
 * Dev-time guard: catches demo-data mistakes (e.g. a listing that cannot be
 * priced under its own primary university) at `next dev` / build time instead
 * of surfacing them as empty prices in the UI.
 */
function assertDemoDataset(): void {
  if (process.env.NODE_ENV === "production") return;

  const capacities = new Set<number>();
  for (const property of PROPERTIES) {
    const university = getUniversity(property.universityIds[0]);
    if (priceForPeriod(property, university.sessionPeriods.basePeriod, university) == null) {
      throw new Error(
        `[demo data] Listing "${property.id}" has no ${university.sessionPeriods.basePeriod} price for ${university.shortName}`,
      );
    }
    if (property.rooms.length === 0) {
      throw new Error(`[demo data] Listing "${property.id}" has no room configurations`);
    }
    for (const room of property.rooms) {
      capacities.add(room.capacity);
      const inventory =
        room.availability.totalRooms != null
          ? room.availability.totalRooms * room.capacity
          : null;
      if (inventory != null && room.availability.availableBeds > inventory) {
        throw new Error(
          `[demo data] Room "${room.id}" claims more available beds than its inventory`,
        );
      }
      if (room.maxOccupancy > room.capacity) {
        throw new Error(`[demo data] Room "${room.id}" maxOccupancy exceeds capacity`);
      }
    }
  }

  for (const capacity of [1, 2, 3, 4, 5, 6]) {
    if (!capacities.has(capacity)) {
      throw new Error(`[demo data] No room of capacity ${capacity} exists in the demo dataset`);
    }
  }
}

assertDemoDataset();

export function getProperty(id: string | undefined): Property | undefined {
  return PROPERTIES.find((property) => property.id === id);
}

export function propertiesForUniversity(universityId: string): Property[] {
  return PROPERTIES.filter((property) => property.universityIds.includes(universityId));
}

/** Every distinct demo area with listing counts, sorted by count then name. */
export function areasWithCounts(): Array<{ area: string; count: number }> {
  const counts = new Map<string, number>();
  for (const property of PROPERTIES) {
    counts.set(property.area, (counts.get(property.area) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count || a.area.localeCompare(b.area));
}
