import type {
  AmenityId,
  Availability,
  BathroomArrangement,
  FurnishingLevel,
  HouseRule,
  PricingBasis,
  Property,
  PropertyImage,
  RoomCapacity,
  RoomConfiguration,
  RoomGradeId,
  RoomPrice,
} from "../types/property";
import type { LandlordDraft, DraftRoom } from "../types/marketplace";
import { getUniversity } from "../data/universities";
import { ROOM_GRADES, ROOM_GRADE_MAP, ROOM_CAPACITY_MAP } from "../data/meta";
import { validateRoom, roomLabel } from "./rooms";

export const DEMO_LANDLORD = {
  id: "demo-landlord-1",
  name: "A. Musa (demo landlord)",
  email: "landlord.demo@offk.example",
  phone: "Demo phone hidden",
};

const RULE_LABELS: Record<string, string> = {
  visitors: "Visitors",
  curfew: "Gate & curfew",
  noise: "Noise",
  smoking: "Smoking",
  pets: "Pets",
  utilities: "Utilities",
  occupancy: "Occupancy",
  deposit: "Deposit & cancellation",
};

export const DRAFT_RULE_KEYS = Object.keys(RULE_LABELS);
export const DRAFT_RULE_LABELS = RULE_LABELS;

export function createEmptyDraft(): LandlordDraft {
  return {
    id: `local-${Date.now().toString(36)}`,
    title: "",
    area: "",
    type: "shared-room",
    universityIds: [],
    description: "",
    furnishing: "furnished",
    amenities: [],
    customAmenities: "",
    rules: ["visitors", "noise", "utilities", "deposit"],
    customRules: "",
    checkInTime: "12:00",
    checkOutTime: "10:00",
    acceptsEnquiries: true,
    acceptsBookings: true,
    contactName: DEMO_LANDLORD.name,
    contactEmail: DEMO_LANDLORD.email,
    contactPhone: "",
    location: {
      mode: "none",
      note: "No location chosen yet.",
    },
    photos: [],
    rooms: [createEmptyDraftRoom(2)],
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyDraftRoom(capacity: RoomCapacity = 2): DraftRoom {
  return {
    id: `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    capacity,
    grade: "standard",
    basis: "per-person",
    bathroom: "shared",
    bedConfiguration: "",
    furnishing: "furnished",
    totalRooms: "1",
    availableBeds: String(capacity),
    availableRooms: "1",
    semesterTotal: "",
    semesterPerPerson: "",
    trimesterTotal: "",
    trimesterPerPerson: "",
    sessionTotal: "",
    sessionPerPerson: "",
    depositAmount: "",
    serviceCharge: "",
    utilityCharge: "",
    refundableDeposit: true,
    amenities: ["desk", "wardrobe", "shared-bathroom"],
    description: "",
    photos: [],
  };
}

function toNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toWholeNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function roomPricesFromDraft(room: DraftRoom): RoomPrice[] {
  const prices: RoomPrice[] = [];
  const depositAmount = toNumber(room.depositAmount);
  const serviceCharge = toNumber(room.serviceCharge);
  const utilityCharge = room.utilityCharge.trim() === "" ? null : toNumber(room.utilityCharge);
  const note =
    room.basis === "per-person"
      ? "Landlord-entered per-person demo quote. The total room price is listed separately."
      : "Landlord-entered whole-room demo quote. No equal-split per-person price is assumed.";

  const add = (
    period: RoomPrice["period"],
    total: number | undefined,
    perPerson: number | undefined,
  ) => {
    if (total == null && perPerson == null) return;
    prices.push({
      period,
      totalAmount: total,
      perPersonAmount: perPerson,
      basis: room.basis,
      currency: "NGN",
      depositAmount,
      refundableDeposit: room.refundableDeposit,
      serviceCharge,
      utilityCharge,
      paymentSchedule: [
        "Deposit on acceptance (demo)",
        "Balance before move-in (demo)",
      ],
      note,
      isSample: true,
    });
  };

  add("semester", toNumber(room.semesterTotal), toNumber(room.semesterPerPerson));
  add("trimester", toNumber(room.trimesterTotal), toNumber(room.trimesterPerPerson));
  add("session", toNumber(room.sessionTotal), toNumber(room.sessionPerPerson));

  return prices;
}

function roomFromDraft(draftRoom: DraftRoom, propertyId: string, index: number): RoomConfiguration {
  const totalRooms = toWholeNumber(draftRoom.totalRooms);
  const availableRooms = toWholeNumber(draftRoom.availableRooms);
  const availableBeds = toWholeNumber(draftRoom.availableBeds) ?? 0;

  return {
    id: `${propertyId}-room-${index + 1}`,
    capacity: draftRoom.capacity,
    grade: draftRoom.grade,
    name: roomLabel(draftRoom.capacity, draftRoom.grade),
    maxOccupancy: draftRoom.capacity,
    bedConfiguration:
      draftRoom.bedConfiguration.trim() || `${draftRoom.capacity} bed spaces (configuration not supplied)`,
    bathroom: draftRoom.bathroom,
    bathroomNote:
      draftRoom.bathroom === "private"
        ? "Private bathroom inside this room type (landlord claim)."
        : draftRoom.bathroom === "shared"
          ? "Bathroom shared with other rooms (landlord claim)."
          : "Bathroom arrangement not specified.",
    furnishing: draftRoom.furnishing,
    amenities: draftRoom.amenities,
    description:
      draftRoom.description.trim() ||
      `${roomLabel(draftRoom.capacity, draftRoom.grade)} — description not supplied yet.`,
    photos: draftRoom.photos,
    prices: roomPricesFromDraft(draftRoom),
    availability: {
      totalRooms: draftRoom.totalRooms.trim() === "" ? null : totalRooms,
      availableRooms: draftRoom.availableRooms.trim() === "" ? null : availableRooms,
      availableBeds,
      note: "Landlord-entered demo availability. No inventory is reserved in the browser demo.",
      isSample: true,
    },
    isSample: true,
  };
}

function aggregateAvailability(rooms: RoomConfiguration[]): Availability {
  const beds = rooms.reduce((sum, room) => sum + Math.max(0, room.availability.availableBeds), 0);
  if (rooms.length === 0) {
    return {
      status: "waitlist",
      label: "No rooms configured",
      note: "Add at least one room configuration.",
      isSample: true,
    };
  }
  if (beds === 0) {
    return {
      status: "fully-booked",
      label: "Fully booked (demo)",
      note: "All configured demo rooms currently show zero available spaces.",
      isSample: true,
    };
  }
  if (beds <= 2) {
    return {
      status: "limited",
      label: `Limited — ${beds} ${beds === 1 ? "space" : "spaces"} left (demo)`,
      note: "Derived from the room availability entered in this local demo listing.",
      isSample: true,
    };
  }
  return {
    status: "available",
    label: `Available — ${beds} spaces (demo)`,
    note: "Derived from the room availability entered in this local demo listing.",
    isSample: true,
  };
}

function rulesFromDraft(draft: LandlordDraft): HouseRule[] {
  const selected = draft.rules.map((key) => ({
    id: key,
    label: RULE_LABELS[key] ?? key,
    description:
      "Landlord-entered sample rule for this local demo listing. Confirm all rules with the landlord before relying on them.",
  }));
  const custom = draft.customRules
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `custom-${index + 1}`,
      label: line,
      description: "Custom demo rule added by the landlord.",
    }));
  return [...selected, ...custom];
}

function aggregatePricing(rooms: RoomConfiguration[]): Property["pricing"] {
  const firstSemester = rooms
    .flatMap((room) => room.prices.filter((price) => price.period === "semester"))
    .map((price) => price.totalAmount ?? price.perPersonAmount)
    .filter((amount): amount is number => amount != null);
  const firstTrimester = rooms
    .flatMap((room) => room.prices.filter((price) => price.period === "trimester"))
    .map((price) => price.totalAmount ?? price.perPersonAmount)
    .filter((amount): amount is number => amount != null);

  return {
    currency: "NGN",
    semesterPrice: firstSemester.length > 0 ? Math.min(...firstSemester) : undefined,
    trimesterPrice: firstTrimester.length > 0 ? Math.min(...firstTrimester) : undefined,
  };
}

export function draftToProperty(draft: LandlordDraft, listingStatus: Property["listingStatus"]): Property {
  const rooms = draft.rooms.map((room, index) => roomFromDraft(room, draft.id, index));
  const primaryUniversity = getUniversity(draft.universityIds[0] ?? "nile");
  const location = draft.location.coords ?? primaryUniversity.coords;
  const photos = draft.photos;
  const maxOccupants = Math.max(...rooms.map((room) => room.capacity), 1);

  return {
    id: draft.id,
    title: draft.title.trim() || "Untitled local demo listing",
    area: draft.area.trim() || primaryUniversity.city,
    universityIds: draft.universityIds.length > 0 ? draft.universityIds : [primaryUniversity.id],
    type: draft.type,
    furnishing: draft.furnishing,
    pricing: aggregatePricing(rooms),
    images: photos,
    coords: location,
    location: {
      coords: location,
      formattedAddress: draft.location.formattedAddress,
      placeId: draft.location.placeId,
      verification:
        draft.location.mode === "google"
          ? "google-verified"
          : draft.location.mode === "demo"
            ? "demo-unverified"
            : "unverified",
      note:
        draft.location.mode === "google"
          ? "Address selected through Google Places. Identity and ownership verification are still pending in this demo."
          : draft.location.mode === "demo"
            ? "Demo location chosen without Google verification. This is not a verified address."
            : "No location selected.",
    },
    amenities: draft.amenities,
    customAmenities: draft.customAmenities
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    houseRules: rulesFromDraft(draft),
    occupancy: {
      description: `${rooms.length} room ${rooms.length === 1 ? "configuration" : "configurations"} entered by the demo landlord.`,
      maxOccupants,
      bathrooms: rooms.filter((room) => room.bathroom === "private").length || 1,
      bedrooms: rooms.length,
      sizeNote: "Room sizes were not supplied in this demo listing.",
    },
    description: draft.description
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    availability: aggregateAvailability(rooms),
    owner: {
      id: DEMO_LANDLORD.id,
      name: DEMO_LANDLORD.name,
      role: "Property owner (demo)",
      joinedLabel: "Demo workspace",
      responseNote: "Saved in this browser only — no notification was sent.",
      contactLabel: draft.contactPhone || "Demo phone hidden",
      isDemo: true,
    },
    landlordId: DEMO_LANDLORD.id,
    contact: {
      name: draft.contactName,
      role: "Property owner",
      email: draft.contactEmail,
      phoneDisplay: draft.contactPhone || "Demo phone hidden",
      isDemo: true,
    },
    nearbyLandmarks: [],
    verification: "pending-demo",
    tags: ["Local demo", "Room-aware"],
    rooms,
    acceptsEnquiries: draft.acceptsEnquiries,
    acceptsBookings: draft.acceptsBookings,
    checkInTime: draft.checkInTime,
    checkOutTime: draft.checkOutTime,
    listingStatus,
    source: "landlord-demo",
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
}

export interface DraftValidation {
  errors: string[];
  stepErrors: Record<number, string[]>;
  completeness: number;
}

function draftStepErrors(draft: LandlordDraft): Record<number, string[]> {
  const stepErrors: Record<number, string[]> = {};

  const step1: string[] = [];
  if (!draft.title.trim()) step1.push("Add a listing name.");
  if (!draft.area.trim()) step1.push("Add an area or neighbourhood.");
  if (draft.universityIds.length === 0) step1.push("Select at least one university.");
  if (draft.description.trim().length < 30) {
    step1.push("Write at least 30 characters of description.");
  }
  if (step1.length > 0) stepErrors[1] = step1;

  const step2: string[] = [];
  if (!draft.contactName.trim()) step2.push("Add a contact name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail)) {
    step2.push("Add a valid contact email.");
  }
  if (!draft.checkInTime || !draft.checkOutTime) step2.push("Set check-in and check-out times.");
  if (step2.length > 0) stepErrors[2] = step2;

  const step3: string[] = [];
  if (draft.location.mode === "none") {
    step3.push("Choose a Google Place or explicitly select a demo location.");
  }
  if (draft.location.mode === "google" && (!draft.location.placeId || !draft.location.coords)) {
    step3.push("Select an address from the Google suggestions — typed text alone is not verified.");
  }
  if (draft.location.mode === "demo" && !draft.location.coords) {
    step3.push("Choose one of the labelled demo locations.");
  }
  if (step3.length > 0) stepErrors[3] = step3;

  const step4: string[] = [];
  if (draft.rooms.length === 0) step4.push("Add at least one room configuration.");
  draft.rooms.forEach((room, index) => {
    const label = `Room ${index + 1}`;
    if (!room.bedConfiguration.trim()) step4.push(`${label}: describe the bed configuration.`);
    const hasPrice =
      toNumber(room.semesterTotal) != null ||
      toNumber(room.semesterPerPerson) != null ||
      toNumber(room.trimesterTotal) != null ||
      toNumber(room.trimesterPerPerson) != null ||
      toNumber(room.sessionTotal) != null ||
      toNumber(room.sessionPerPerson) != null;
    if (!hasPrice) step4.push(`${label}: add at least one room price.`);
    if (room.basis === "per-person" && toNumber(room.semesterPerPerson) == null && toNumber(room.trimesterPerPerson) == null && toNumber(room.sessionPerPerson) == null) {
      step4.push(`${label}: per-person pricing needs a per-person amount.`);
    }
    if (room.basis === "per-room" && toNumber(room.semesterTotal) == null && toNumber(room.trimesterTotal) == null && toNumber(room.sessionTotal) == null) {
      step4.push(`${label}: per-room pricing needs a total-room amount.`);
    }
    const inventoryBeds =
      (toWholeNumber(room.totalRooms) ?? 1) * room.capacity;
    const availableBeds = toWholeNumber(room.availableBeds) ?? 0;
    if (availableBeds > inventoryBeds) {
      step4.push(`${label}: available spaces cannot exceed total rooms × capacity.`);
    }
    if (availableBeds < 0) step4.push(`${label}: availability cannot be negative.`);
    const totalRooms = toWholeNumber(room.totalRooms);
    const availableRooms = toWholeNumber(room.availableRooms);
    if (
      totalRooms != null &&
      availableRooms != null &&
      availableRooms > totalRooms
    ) {
      step4.push(`${label}: available rooms cannot exceed total rooms.`);
    }
  });

  for (const universityId of draft.universityIds) {
    const university = getUniversity(universityId);
    const basePeriod = university.sessionPeriods.basePeriod;
    draft.rooms.forEach((room, index) => {
      const label = `Room ${index + 1}`;
      const totalKey = basePeriod === "semester" ? "semesterTotal" : "trimesterTotal";
      const personKey =
        basePeriod === "semester" ? "semesterPerPerson" : "trimesterPerPerson";
      const hasAmount =
        room.basis === "per-person"
          ? room[personKey].trim() !== ""
          : room[totalKey].trim() !== "";
      if (!hasAmount) {
        step4.push(
          `${label}: add a ${basePeriod} ${
            room.basis === "per-person" ? "per-person" : "total-room"
          } price for ${university.shortName}.`,
        );
      }
    });
  }
  if (step4.length > 0) stepErrors[4] = step4;

  const step5: string[] = [];
  if (draft.photos.length === 0) step5.push("Upload at least one property photo.");
  if (step5.length > 0) stepErrors[5] = step5;

  return stepErrors;
}

export function validateDraft(draft: LandlordDraft): DraftValidation {
  const stepErrors = draftStepErrors(draft);
  const errors = Object.values(stepErrors).flat();
  const completeness = draftCompleteness(draft);
  return { errors, stepErrors, completeness };
}

export function draftCompleteness(draft: LandlordDraft): number {
  const checks = [
    Boolean(draft.title.trim()),
    Boolean(draft.area.trim()),
    draft.universityIds.length > 0,
    draft.description.trim().length >= 30,
    Boolean(draft.contactName.trim()),
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail),
    draft.location.mode !== "none",
    draft.rooms.length > 0,
    draft.rooms.every(
      (room) =>
        room.bedConfiguration.trim().length > 0 &&
        [
          room.semesterTotal,
          room.semesterPerPerson,
          room.trimesterTotal,
          room.trimesterPerPerson,
          room.sessionTotal,
          room.sessionPerPerson,
        ].some((value) => value.trim() !== ""),
    ),
    draft.photos.length > 0,
    draft.amenities.length > 0,
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

/**
 * Validates the generated room shapes too, so a draft that passes step checks
 * can't smuggle an invalid room into the local marketplace.
 */
export function validateGeneratedProperty(property: Property): string[] {
  const errors: string[] = [];
  if (property.rooms.length === 0) errors.push("Add at least one room configuration.");
  for (const room of property.rooms) {
    errors.push(...validateRoom(room, { requirePrice: true }));
    if (room.photos.length === 0) {
      // Empty room galleries are allowed and shown honestly; this is a note, not
      // a blocking error, so it is intentionally not pushed here.
    }
  }
  return errors;
}

export function draftRoomSummary(room: DraftRoom): string {
  const capacity = ROOM_CAPACITY_MAP[room.capacity]?.label ?? `Room of ${room.capacity}`;
  const grade = ROOM_GRADE_MAP[room.grade]?.label ?? room.grade;
  return `${capacity} · ${grade}`;
}

export function galleryImages(propertyPhotos: PropertyImage[], roomPhotos: PropertyImage[]): PropertyImage[] {
  return [...roomPhotos, ...propertyPhotos];
}

export const DRAFT_GRADE_IDS = ROOM_GRADES.map((grade) => grade.id);

export type { BathroomArrangement, FurnishingLevel, PricingBasis, RoomGradeId, AmenityId };
