/**
 * Dependency-free checks for the pricing and distance utilities.
 * Run with: npm run check:logic   (Node ≥ 22.6 strips the types natively)
 *
 * These assert the university pricing models required by the brief:
 *   - Nile:  session = semester × 2 (unless a listing sets its own session price)
 *   - Baze:  session = trimester × 3 (unless a listing sets its own session price)
 *   - periods a listing cannot price resolve to `null`, never an invented number
 *
 * Listing fixtures are defined inline (the demo dataset itself is validated at
 * app start-up by `assertDemoDataset()` in src/data/properties.ts).
 */
import { formatStraightLineDistance, haversineKm } from "../src/lib/distance.ts";
import { formatNaira } from "../src/lib/format-currency.ts";
import { fromPrice, priceForPeriod, sessionComparison } from "../src/lib/pricing.ts";
import { UNIVERSITIES } from "../src/data/universities.ts";
import {
  NO_ROOM_PHOTOS_MESSAGE,
  SUPPORTED_CAPACITIES,
  groupCapacityErrors,
  illustrativeLabel,
  pricingBasisLabel,
  roomAvailability,
  roomPhotoSet,
  roomQuote,
  sortRooms,
  spacesSummary,
  validateRoom,
} from "../src/lib/rooms.ts";
import { STOCK_ROOM_PHOTOS } from "../src/data/stock-photos.ts";
import type {
  PricingBasis,
  Property,
  PropertyImage,
  RentalPricing,
  RoomCapacity,
  RoomConfiguration,
  RoomGradeId,
} from "../src/types/property.ts";
import type { University } from "../src/types/university.ts";

let failures = 0;

function expect(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures++;
    console.error(`✗ ${label}\n    expected: ${JSON.stringify(expected)}\n    actual:   ${JSON.stringify(actual)}`);
  } else {
    console.log(`✓ ${label}`);
  }
}

const nile = UNIVERSITIES.find((u) => u.id === "nile") as University;
const baze = UNIVERSITIES.find((u) => u.id === "baze") as University;

/** Minimal Property fixture — only the fields the pricing logic reads. */
function fixture(id: string, universityIds: string[], pricing: RentalPricing): Property {
  return {
    id,
    title: id,
    area: "Demo area",
    universityIds,
    type: "studio",
    furnishing: "furnished",
    pricing,
    images: [],
    coords: { lat: 0, lng: 0 },
    amenities: [],
    houseRules: [],
    occupancy: { description: "", maxOccupants: 1, bathrooms: 1, bedrooms: 1, sizeNote: "" },
    description: [],
    availability: { status: "available", label: "", note: "", isSample: true },
    owner: { id: "", name: "", role: "", joinedLabel: "", responseNote: "", contactLabel: "", isDemo: true },
    landlordId: "demo-landlord-1",
    contact: { name: "", role: "", email: "", phoneDisplay: "", isDemo: true },
    nearbyLandmarks: [],
    verification: "verified-demo",
    tags: [],
    rooms: [],
    acceptsEnquiries: true,
    acceptsBookings: true,
    checkInTime: "",
    checkOutTime: "",
    listingStatus: "published",
    source: "seed",
    isDemo: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

const nileSemesterOnly = fixture("nile-semester-only", ["nile"], { currency: "NGN", semesterPrice: 280_000 });
const nileExplicitSession = fixture("nile-explicit-session", ["nile"], {
  currency: "NGN",
  semesterPrice: 850_000,
  sessionPrice: 1_480_000,
});
const bazeTrimesterOnly = fixture("baze-trimester-only", ["baze"], { currency: "NGN", trimesterPrice: 380_000 });
const bazeExplicitSession = fixture("baze-explicit-session", ["baze"], {
  currency: "NGN",
  trimesterPrice: 310_000,
  sessionPrice: 880_000,
});
const bazePremium = fixture("baze-premium", ["baze"], {
  currency: "NGN",
  trimesterPrice: 620_000,
  sessionPrice: 1_750_000,
});
const crossCampus = fixture("cross-campus", ["nile", "baze"], {
  currency: "NGN",
  semesterPrice: 430_000,
  trimesterPrice: 265_000,
});

// --- Nile model -------------------------------------------------------------
expect(
  "Nile: derived session price = semester × 2",
  priceForPeriod(nileSemesterOnly, "session", nile)?.amount,
  280_000 * 2,
);
expect(
  "Nile: derived session carries its formula",
  priceForPeriod(nileSemesterOnly, "session", nile)?.derivation,
  { baseAmount: 280_000, periods: 2, periodLabel: "semesters" },
);
expect(
  "Nile: explicit session price wins over the derived one",
  priceForPeriod(nileExplicitSession, "session", nile)?.amount,
  1_480_000,
);
expect(
  "Nile: semester price passes through",
  priceForPeriod(nileExplicitSession, "semester", nile)?.amount,
  850_000,
);

// --- Baze model -------------------------------------------------------------
expect(
  "Baze: derived session price = trimester × 3",
  priceForPeriod(bazeTrimesterOnly, "session", baze)?.amount,
  380_000 * 3,
);
expect(
  "Baze: derived session formula uses trimesters",
  priceForPeriod(bazeTrimesterOnly, "session", baze)?.derivation,
  { baseAmount: 380_000, periods: 3, periodLabel: "trimesters" },
);
expect(
  "Baze: explicit session price wins over the derived one",
  priceForPeriod(bazeExplicitSession, "session", baze)?.amount,
  880_000,
);
expect(
  "Baze: trimester price passes through",
  priceForPeriod(bazePremium, "trimester", baze)?.amount,
  620_000,
);

// --- Unsupported periods resolve to null, never an invented number ----------
expect(
  "Nile semester-only listing → null trimester under Baze",
  priceForPeriod(nileSemesterOnly, "trimester", baze),
  null,
);
expect(
  "Nile semester-only listing → null session under Baze (no trimester base)",
  priceForPeriod(nileSemesterOnly, "session", baze),
  null,
);
expect(
  "Baze trimester-only listing → null semester under Nile",
  priceForPeriod(bazeTrimesterOnly, "semester", nile),
  null,
);
expect(
  "Baze trimester-only listing → null session under Nile (no semester base)",
  priceForPeriod(bazeTrimesterOnly, "session", nile),
  null,
);

// --- Cross-campus listing prices under both models ---------------------------
expect(
  "Cross-campus: semester under Nile",
  priceForPeriod(crossCampus, "semester", nile)?.amount,
  430_000,
);
expect(
  "Cross-campus: trimester under Baze",
  priceForPeriod(crossCampus, "trimester", baze)?.amount,
  265_000,
);

// --- Session savings comparison ---------------------------------------------
expect(
  "Nile: explicit session saving vs 2 semesters",
  sessionComparison(nileExplicitSession, nile)?.saving,
  850_000 * 2 - 1_480_000,
);
expect(
  "Baze: explicit session saving vs 3 trimesters",
  sessionComparison(bazeExplicitSession, baze)?.saving,
  310_000 * 3 - 880_000,
);
expect(
  "Baze: premium flat session saving",
  sessionComparison(bazePremium, baze)?.saving,
  620_000 * 3 - 1_750_000,
);
expect(
  "No comparison when a listing has no explicit session price",
  sessionComparison(nileSemesterOnly, nile),
  null,
);
expect(
  "No comparison when an explicit session price is not a discount",
  sessionComparison(fixture("no-discount", ["baze"], { currency: "NGN", trimesterPrice: 300_000, sessionPrice: 950_000 }), baze),
  null,
);

// --- fromPrice (cheapest comparable price) -----------------------------------
expect(
  "fromPrice picks the cheapest period price",
  fromPrice(crossCampus, baze)?.amount,
  265_000,
);
expect(
  "fromPrice is null when a university has no price at all",
  fromPrice(bazeTrimesterOnly, nile),
  null,
);

// --- Distance ---------------------------------------------------------------
expect(
  "Haversine: one degree of latitude ≈ 111.19 km",
  Math.abs(haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }) - 111.19) < 0.01,
  true,
);
expect(
  "Haversine is symmetric",
  haversineKm({ lat: 9.0, lng: 7.5 }, { lat: 9.1, lng: 7.6 }),
  haversineKm({ lat: 9.1, lng: 7.6 }, { lat: 9.0, lng: 7.5 }),
);
expect("Haversine: identical points are 0 km", haversineKm({ lat: 9, lng: 7 }, { lat: 9, lng: 7 }), 0);
expect("Sub-kilometre distances format as metres", formatStraightLineDistance(0.85), "850 m");
expect("Kilometre distances show one decimal", formatStraightLineDistance(1.84), "1.8 km");

// --- Currency ---------------------------------------------------------------
expect("Currency formats with the naira symbol", formatNaira(350_000), "₦350,000");
expect("Currency formats millions", formatNaira(2_150_000), "₦2,150,000");

// --- University model sanity -------------------------------------------------
expect("Nile models 2 semesters per session", nile.sessionPeriods.count, 2);
expect("Nile's base period is the semester", nile.sessionPeriods.basePeriod, "semester");
expect("Baze models 3 trimesters per session", baze.sessionPeriods.count, 3);
expect("Baze's base period is the trimester", baze.sessionPeriods.basePeriod, "trimester");

// --- Rooms: capacity, vacancy, photos, pricing -------------------------------
function roomFixture(
  capacity: RoomCapacity,
  options: {
    grade?: RoomGradeId;
    photos?: PropertyImage[];
    totalRooms?: number | null;
    availableBeds?: number;
    basis?: PricingBasis;
    total?: number;
    perPerson?: number;
  } = {},
): RoomConfiguration {
  const basis = options.basis ?? "per-room";
  return {
    id: `fx-${capacity}-${options.grade ?? "standard"}`,
    capacity,
    grade: options.grade ?? "standard",
    name: `Room of ${capacity}`,
    maxOccupancy: capacity,
    bedConfiguration: `${capacity} beds`,
    bathroom: "shared",
    bathroomNote: "",
    furnishing: "furnished",
    amenities: [],
    description: "",
    photos: options.photos ?? [],
    prices: [
      {
        period: "semester",
        totalAmount: options.total,
        perPersonAmount: options.perPerson,
        basis,
        currency: "NGN",
        isSample: true,
      },
    ],
    availability: {
      totalRooms: options.totalRooms === undefined ? 2 : options.totalRooms,
      availableRooms: 1,
      availableBeds: options.availableBeds ?? 1,
      note: "",
      isSample: true,
    },
    isSample: true,
  };
}

expect("Exactly six room capacities are supported", SUPPORTED_CAPACITIES, [1, 2, 3, 4, 5, 6]);

for (const capacity of SUPPORTED_CAPACITIES) {
  const room = roomFixture(capacity, { availableBeds: capacity, total: 100_000 });
  expect(
    `Room of ${capacity}: validates with capacity ${capacity} and no errors`,
    validateRoom(room, { requirePrice: true }),
    [],
  );
}
expect(
  "Capacity 7 is rejected",
  validateRoom(roomFixture(7 as RoomCapacity)).some((message) => message.includes("1, 2, 3, 4, 5 or 6")),
  true,
);

const roomOf4OneVacant = roomFixture(4, { totalRooms: 2, availableBeds: 1, total: 400_000 });
expect("Room of 4 with one vacant bed keeps capacity 4", roomOf4OneVacant.capacity, 4);
expect("…and reports exactly one available space", roomAvailability(roomOf4OneVacant).availableBeds, 1);
expect("…labelled as 1 space left, not a room of 1", roomAvailability(roomOf4OneVacant).label, "1 space left");
expect("…summarised against inventory, not capacity", spacesSummary(roomOf4OneVacant), "1 of 8 spaces free");
expect(
  "Vacancy above inventory is rejected",
  validateRoom(roomFixture(2, { totalRooms: 1, availableBeds: 3, total: 1 })).length > 0,
  true,
);

expect(
  "sortRooms orders by capacity, then grade, without mutating the input",
  (() => {
    const input = [
      roomFixture(6),
      roomFixture(2, { grade: "premium" }),
      roomFixture(1),
      roomFixture(2, { grade: "standard" }),
      roomFixture(4),
      roomFixture(3),
      roomFixture(5),
    ];
    const before = input.map((room) => room.id).join();
    const sorted = sortRooms(input).map((room) => `${room.capacity}-${room.grade}`);
    return { sorted, untouched: input.map((room) => room.id).join() === before };
  })(),
  {
    sorted: ["1-standard", "2-standard", "2-premium", "3-standard", "4-standard", "5-standard", "6-standard"],
    untouched: true,
  },
);

// Photos: honest empty state, and no borrowing between room types.
const demoPhoto = (src: string): PropertyImage => ({ src, alt: "demo", kind: "photo", isDemo: true });
const uploadPhoto = (src: string): PropertyImage => ({ src, alt: "upload", kind: "upload" });
expect("Room with no photos reports the empty state", roomPhotoSet(roomFixture(3)).isEmpty, true);
expect("…and returns zero photos (no fallback image)", roomPhotoSet(roomFixture(3)).photos.length, 0);
expect("Empty-state wording matches the brief", NO_ROOM_PHOTOS_MESSAGE, "No photos have been uploaded for this room type yet.");
expect("Missing room reports the empty state", roomPhotoSet(undefined).isEmpty, true);
expect(
  "Two room types return different photo sets",
  (() => {
    const a = roomPhotoSet(roomFixture(2, { photos: [demoPhoto("/a.jpg")] })).photos.map((p) => p.src);
    const b = roomPhotoSet(roomFixture(4, { photos: [demoPhoto("/b.jpg")] })).photos.map((p) => p.src);
    return { a, b, disjoint: a.every((src) => !b.includes(src)) };
  })(),
  { a: ["/a.jpg"], b: ["/b.jpg"], disjoint: true },
);
expect("All-demo photos are flagged illustrative", roomPhotoSet(roomFixture(1, { photos: [demoPhoto("/a.jpg")] })).allIllustrative, true);
expect(
  "A landlord upload is not flagged illustrative",
  roomPhotoSet(roomFixture(1, { photos: [uploadPhoto("/u.jpg")] })).allIllustrative,
  false,
);
expect("Stock photo gets the illustrative label", illustrativeLabel(demoPhoto("/a.jpg")), "Illustrative photo — not this property");
expect(
  "Drawn illustration gets its own label",
  illustrativeLabel({ src: "/i.svg", alt: "i", kind: "illustration" }),
  "Demo illustration — not a photo",
);
expect("Landlord upload gets no demo label", illustrativeLabel(uploadPhoto("/u.jpg")), null);

// The bundled stock photography itself.
const stockSources = SUPPORTED_CAPACITIES.flatMap((capacity) => STOCK_ROOM_PHOTOS[capacity].map((photo) => photo.src));
expect(
  "Every capacity (1–6) has at least one stock photo",
  SUPPORTED_CAPACITIES.map((capacity) => STOCK_ROOM_PHOTOS[capacity].length > 0),
  [true, true, true, true, true, true],
);
expect("No stock photo is reused across (or within) room capacities", new Set(stockSources).size, stockSources.length);
expect(
  "Every stock room photo is flagged demo and says it is illustrative",
  SUPPORTED_CAPACITIES.every((capacity) =>
    STOCK_ROOM_PHOTOS[capacity].every((photo) => photo.isDemo === true && photo.alt.includes("Illustrative only")),
  ),
  true,
);

// Pricing: total and per-person stay separate; basis is always explicit.
const perRoom = roomQuote(roomFixture(4, { basis: "per-room", total: 600_000 }), "nile", "semester", nile, 2);
expect("Per-room quote: headline is the room total", perRoom?.headlineAmount, 600_000);
expect("Per-room quote: no per-person price is invented", perRoom?.perPersonAmount, null);
expect("Per-room quote: payable stays the whole room regardless of occupants", perRoom?.payableAmount, 600_000);
const perPerson = roomQuote(
  roomFixture(4, { basis: "per-person", perPerson: 150_000, total: 600_000 }),
  "nile",
  "semester",
  nile,
  3,
);
expect("Per-person quote: headline is the per-person price", perPerson?.headlineAmount, 150_000);
expect("Per-person quote: room total kept separately", perPerson?.totalAmount, 600_000);
expect("Per-person quote: payable = per-person × occupants", perPerson?.payableAmount, 450_000);
expect(
  "A period the room does not price resolves to null, not a number",
  roomQuote(roomFixture(2, { total: 1 }), "nile", "trimester", nile),
  null,
);
expect("Basis labels", [pricingBasisLabel("per-room"), pricingBasisLabel("per-person")], ["per room", "per person"]);

// Group sizing.
expect(
  "Group larger than the room is rejected",
  groupCapacityErrors({ room: roomFixture(2, { availableBeds: 2 }), spaces: 3, members: 1 }).length > 0,
  true,
);
expect(
  "Group larger than the free spaces is rejected",
  groupCapacityErrors({ room: roomFixture(4, { availableBeds: 1 }), spaces: 2, members: 1 }).length > 0,
  true,
);
expect(
  "Group that fits is accepted",
  groupCapacityErrors({ room: roomFixture(4, { availableBeds: 3 }), spaces: 3, members: 2 }),
  [],
);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll pricing/distance checks passed.");
