import type {
  AccommodationTypeId,
  AmenityId,
  BathroomArrangement,
  FurnishingLevel,
  PricingBasis,
  Property,
  PropertyImage,
  RoomCapacity,
  RoomGradeId,
} from "./property";
import type { RentalPeriodId } from "./university";

/**
 * Marketplace records for the local demo.
 *
 * These shapes are deliberately close to the Supabase tables described in
 * `MARKETPLACE.md`, but everything here is persisted in this browser's
 * localStorage only. No record is sent to a server, and no status implies a
 * real payment, publication or landlord action outside this demo.
 */

export type EnquiryStatus =
  | "draft"
  | "submitted"
  | "under-review"
  | "accepted"
  | "rejected"
  | "payment-pending"
  | "partially-paid"
  | "fully-paid"
  | "confirmed"
  | "cancelled"
  | "expired";

export interface Enquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  area: string;
  landlordId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomId: string;
  roomName: string;
  capacity: RoomCapacity;
  grade: RoomGradeId;
  universityId: string;
  period: RentalPeriodId;
  occupants: number;
  moveIn: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  status: EnquiryStatus;
  /** The student-facing quote captured when the enquiry was submitted. */
  quotedTotalAmount?: number;
  quotedPerPersonAmount?: number;
  quotedBasis?: PricingBasis;
  landlordResponse?: string;
  rejectionReason?: string;
  /** Only present once the landlord accepts. */
  bookingRef?: string;
  paymentDeadline?: string;
  holdId?: string;
  isDemo: true;
}

export type GroupStatus = "open" | "full" | "closed" | "cancelled" | "expired";
export type GroupMemberStatus = "invited" | "joined" | "declined" | "removed";
export type MemberPaymentStatus = "unpaid" | "partially-paid" | "paid-demo";

export interface GroupMember {
  id: string;
  name: string;
  isOrganiser: boolean;
  status: GroupMemberStatus;
  paymentStatus: MemberPaymentStatus;
  paidAmount: number;
  joinedAt: string;
}

export interface GroupBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  area: string;
  landlordId: string;
  organiserId: string;
  roomId: string;
  roomName: string;
  capacity: RoomCapacity;
  grade: RoomGradeId;
  universityId: string;
  period: RentalPeriodId;
  spaces: number;
  members: GroupMember[];
  perMemberAmount: number;
  totalAmount: number;
  totalBasis: PricingBasis;
  deadline: string;
  createdAt: string;
  status: GroupStatus;
  /** Landlord-enabled priority, disclosed only when the rules are met. */
  landlordPriority: boolean;
  priorityNote: string;
  isDemo: true;
}

export type PaymentStatus = "pending" | "paid-demo" | "failed-demo" | "abandoned-demo";
export type PaymentProvider = "demo" | "paystack";

export interface PaymentRecord {
  id: string;
  kind: "enquiry" | "group";
  /** Enquiry id or group id. */
  referenceId: string;
  /** Group member id, when the payment belongs to one member. */
  memberId?: string;
  payerName: string;
  amount: number;
  status: PaymentStatus;
  provider: PaymentProvider;
  /** Paystack reference placeholder. Empty for demo records. */
  providerReference?: string;
  createdAt: string;
  note: string;
  isDemo: true;
}

export type InspectionStatus = "requested" | "scheduled" | "completed" | "cancelled";

export interface InspectionRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  roomId?: string;
  studentId: string;
  studentName: string;
  preferredDate: string;
  note: string;
  status: InspectionStatus;
  landlordNote?: string;
  createdAt: string;
  isDemo: true;
}

export interface AppNotification {
  id: string;
  audience: "student" | "landlord";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
  isDemo: true;
}

export type HoldStatus = "active" | "expired" | "released" | "converted";

export interface AvailabilityHold {
  id: string;
  propertyId: string;
  roomId: string;
  /**
   * Beds held. Enquiries do NOT create a hold on submission; only an accepted
   * enquiry or a landlord action does.
   */
  beds: number;
  reason: "accepted-enquiry" | "group-priority" | "landlord";
  referenceId?: string;
  createdAt: string;
  expiresAt: string;
  status: HoldStatus;
  isDemo: true;
}

/** A Google Routes result saved after a successful live request. */
export interface RoadRouteResult {
  key: string;
  propertyId: string;
  universityId: string;
  travelMode: "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT";
  distanceKm: number;
  durationMinutes: number;
  fetchedAt: string;
  isLive: true;
  provider: "google-routes";
}

export interface ListingDraftSummary {
  id: string;
  title: string;
  status: "draft" | "published-demo" | "paused";
  createdAt: string;
  updatedAt: string;
  completeness: number;
  roomCount: number;
  photoCount: number;
}

/* ------------------------------------------------------------------ *
 * Landlord listing wizard draft (browser-local, Supabase-ready shape)
 * ------------------------------------------------------------------ */

export interface DraftLocation {
  mode: "google" | "demo" | "none";
  formattedAddress?: string;
  placeId?: string;
  /** Straight from the Google Place selection when `mode === "google"`. */
  coords?: { lat: number; lng: number };
  note: string;
}

export interface DraftRoom {
  id: string;
  capacity: RoomCapacity;
  grade: RoomGradeId;
  basis: PricingBasis;
  bathroom: BathroomArrangement;
  bedConfiguration: string;
  furnishing: FurnishingLevel;
  totalRooms: string;
  availableBeds: string;
  availableRooms: string;
  semesterTotal: string;
  semesterPerPerson: string;
  trimesterTotal: string;
  trimesterPerPerson: string;
  sessionTotal: string;
  sessionPerPerson: string;
  depositAmount: string;
  serviceCharge: string;
  utilityCharge: string;
  refundableDeposit: boolean;
  amenities: AmenityId[];
  description: string;
  photos: PropertyImage[];
}

export interface LandlordDraft {
  id: string;
  title: string;
  area: string;
  type: AccommodationTypeId;
  universityIds: string[];
  description: string;
  furnishing: FurnishingLevel;
  amenities: AmenityId[];
  customAmenities: string;
  rules: string[];
  customRules: string;
  checkInTime: string;
  checkOutTime: string;
  acceptsEnquiries: boolean;
  acceptsBookings: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  location: DraftLocation;
  photos: PropertyImage[];
  rooms: DraftRoom[];
  updatedAt: string;
}

export interface LocalListingRecord {
  property: Property;
  status: "published-demo" | "draft" | "paused";
  completeness: number;
  createdAt: string;
  updatedAt: string;
}

