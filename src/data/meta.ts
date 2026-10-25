import type {
  AccommodationTypeMeta,
  AmenityMeta,
  BathroomArrangementMeta,
  FurnishingMeta,
  PricingBasisMeta,
  RoomCapacityMeta,
  RoomGradeMeta,
} from "../types/property";

export const ACCOMMODATION_TYPES: AccommodationTypeMeta[] = [
  { id: "shared-room", label: "Shared room", description: "Own bed in a shared bedroom" },
  { id: "private-room", label: "Private room", description: "Private bedroom, shared living spaces" },
  { id: "studio", label: "Self-contained studio", description: "Single room with kitchen & bath" },
  { id: "one-bedroom", label: "One-bedroom apartment", description: "Separate bedroom and lounge" },
  { id: "shared-apartment", label: "Shared apartment", description: "Private room in a shared flat" },
  { id: "two-bedroom", label: "Two-bedroom apartment", description: "Larger flat, ideal for two" },
];

export const ACCOMMODATION_TYPE_MAP: Record<string, AccommodationTypeMeta> = Object.fromEntries(
  ACCOMMODATION_TYPES.map((t) => [t.id, t]),
);

export const FURNISHING_LEVELS: FurnishingMeta[] = [
  { id: "furnished", label: "Furnished" },
  { id: "semi-furnished", label: "Semi-furnished" },
  { id: "unfurnished", label: "Unfurnished" },
];

export const FURNISHING_MAP: Record<string, FurnishingMeta> = Object.fromEntries(
  FURNISHING_LEVELS.map((f) => [f.id, f]),
);

/**
 * The only supported room capacities. UI selectors, validation and group-size
 * checks all read from this list — no free-text capacity is accepted.
 */
export const ROOM_CAPACITIES: RoomCapacityMeta[] = [
  { capacity: 1, label: "Room of 1", description: "One student, one bed" },
  { capacity: 2, label: "Room of 2", description: "Two students, two beds" },
  { capacity: 3, label: "Room of 3", description: "Three students, three beds" },
  { capacity: 4, label: "Room of 4", description: "Four students, four beds" },
  { capacity: 5, label: "Room of 5", description: "Five students, five beds" },
  { capacity: 6, label: "Room of 6", description: "Six students, six beds" },
];

export const ROOM_CAPACITY_MAP: Record<number, RoomCapacityMeta> = Object.fromEntries(
  ROOM_CAPACITIES.map((entry) => [entry.capacity, entry]),
);

export const ROOM_GRADES: RoomGradeMeta[] = [
  { id: "standard", label: "Standard", description: "Clean, practical shared or private room" },
  { id: "premium", label: "Premium", description: "Larger room or better fittings" },
  { id: "executive", label: "Executive", description: "Upgraded room with extra workspace" },
  { id: "ensuite", label: "Ensuite", description: "Bathroom inside the room" },
  { id: "deluxe", label: "Deluxe", description: "Largest layout with premium furnishings" },
  { id: "special", label: "Special", description: "Accessible or uniquely configured room" },
];

export const ROOM_GRADE_MAP: Record<string, RoomGradeMeta> = Object.fromEntries(
  ROOM_GRADES.map((grade) => [grade.id, grade]),
);

export const PRICING_BASES: PricingBasisMeta[] = [
  {
    id: "per-room",
    label: "Per room",
    shortLabel: "room",
    description: "One quoted price for the whole room, regardless of how occupants split it.",
  },
  {
    id: "per-person",
    label: "Per person",
    shortLabel: "person",
    description: "Each occupant is quoted separately. The total room price is shown separately when listed.",
  },
];

export const PRICING_BASIS_MAP: Record<string, PricingBasisMeta> = Object.fromEntries(
  PRICING_BASES.map((basis) => [basis.id, basis]),
);

export const BATHROOM_ARRANGEMENTS: BathroomArrangementMeta[] = [
  { id: "private", label: "Private bathroom", description: "Bathroom inside this room" },
  { id: "shared", label: "Shared bathroom", description: "Shared with other rooms" },
  { id: "not-specified", label: "Not specified", description: "Landlord has not confirmed the bathroom arrangement" },
];

export const BATHROOM_ARRANGEMENT_MAP: Record<string, BathroomArrangementMeta> = Object.fromEntries(
  BATHROOM_ARRANGEMENTS.map((entry) => [entry.id, entry]),
);

export const AMENITIES: AmenityMeta[] = [
  { id: "wifi", label: "Wi-Fi", note: "Demo listing claims Wi-Fi coverage — confirm current speed with the owner." },
  { id: "power", label: "24/7 power", note: "Demo label for a metered supply with a backup plan." },
  { id: "generator", label: "Generator", note: "Shared or private generator access (sample data)." },
  { id: "water", label: "Water supply", note: "Treated or borehole water supply (sample data)." },
  { id: "borehole", label: "Borehole", note: "On-site borehole (sample data)." },
  { id: "furnished", label: "Furnished room", note: "Bed, wardrobe and study desk included (sample data)." },
  { id: "kitchen", label: "Kitchen access", note: "Shared or private kitchen (sample data)." },
  { id: "private-bathroom", label: "Private bathroom", note: "En-suite bathroom (sample data)." },
  { id: "shared-bathroom", label: "Shared bathroom", note: "Shared with other residents (sample data)." },
  { id: "security", label: "Security", note: "Estate or compound security (sample data)." },
  { id: "cctv", label: "CCTV", note: "CCTV coverage claimed in this demo listing." },
  { id: "parking", label: "Parking", note: "Off-street parking (sample data)." },
  { id: "laundry", label: "Laundry", note: "Laundry area or service (sample data)." },
  { id: "air-conditioning", label: "Air conditioning", note: "Fixed AC units (sample data)." },
  { id: "study-area", label: "Study area", note: "Quiet study space in the compound (sample data)." },
  { id: "desk", label: "Study desk", note: "A desk in the room (sample data)." },
  { id: "wardrobe", label: "Wardrobe", note: "Personal storage in the room (sample data)." },
  { id: "reading-lamp", label: "Reading lamp", note: "Bedside reading light (sample data)." },
  { id: "fan", label: "Ceiling fan", note: "Ceiling or standing fan (sample data)." },
  { id: "locker", label: "Personal locker", note: "Lockable storage for each resident (sample data)." },
  { id: "balcony", label: "Balcony", note: "Outdoor space attached to the room or flat (sample data)." },
  { id: "water-heater", label: "Water heater", note: "Hot water available (sample data)." },
  { id: "microwave", label: "Microwave", note: "Microwave access (sample data)." },
  { id: "refrigerator", label: "Refrigerator", note: "Fridge space (sample data)." },
  { id: "cooktop", label: "Cooktop", note: "Cooking hob access (sample data)." },
  { id: "cleaning", label: "Cleaning service", note: "Shared-area cleaning claimed by the listing (sample data)." },
  { id: "common-room", label: "Common room", note: "Shared lounge or common room (sample data)." },
  { id: "gym", label: "Gym", note: "On-site gym (sample data)." },
  { id: "bicycle-storage", label: "Bicycle storage", note: "Secure bicycle parking (sample data)." },
  { id: "accessible", label: "Step-free access", note: "Landlord claims step-free access — confirm in person (sample data)." },
  { id: "fire-safety", label: "Fire safety", note: "Extinguisher or alarm claimed by the listing (sample data)." },
];

export const AMENITY_MAP: Record<string, AmenityMeta> = Object.fromEntries(
  AMENITIES.map((a) => [a.id, a]),
);

/** Curated subsets used by the listing wizard so long amenity lists stay usable. */
export const PROPERTY_AMENITY_IDS = AMENITIES.slice(0, 15).map((a) => a.id);
export const ROOM_AMENITY_IDS = AMENITIES.slice(15).map((a) => a.id);
