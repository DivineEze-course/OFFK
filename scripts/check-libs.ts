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
import type { Property, RentalPricing } from "../src/types/property.ts";
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

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll pricing/distance checks passed.");
