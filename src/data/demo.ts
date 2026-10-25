import type { BookingRequest } from "../types/property";

/**
 * DEMO DATA — fake student/landlord content used by the dashboard placeholders.
 * Nothing here is real; nothing here is sent anywhere.
 */

export const DEMO_STUDENT = {
  name: "Chidinma O. (demo student)",
  email: "chidinma.demo@offk.example",
  universityId: "nile",
  course: "Computer Science (sample)",
  moveInWindow: "September (sample)",
  budgetNote: "₦300k–₦900k per semester (sample)",
  isDemo: true as const,
};

export const DEMO_BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: "req-1001",
    propertyId: "abi-jabi-garden-court",
    propertyName: "Garden Court Shared Room (2 beds)",
    area: "Jabi",
    universityId: "nile",
    period: "semester",
    requestedAtLabel: "12 Oct 2026 (sample)",
    moveInLabel: "Late October (sample)",
    status: "reviewing",
    statusNote: "Demo status — no message was actually sent.",
    isDemo: true,
  },
  {
    id: "req-1002",
    propertyId: "bze-baze-road-studio",
    propertyName: "Gudu Self-Contain Studio",
    area: "Gudu",
    universityId: "baze",
    period: "trimester",
    requestedAtLabel: "8 Oct 2026 (sample)",
    moveInLabel: "November (sample)",
    status: "accepted",
    statusNote: "Demo status — no message was actually sent.",
    isDemo: true,
  },
  {
    id: "req-1003",
    propertyId: "abi-life-camp-suite",
    propertyName: "Life Camp Executive Studio",
    area: "Life Camp",
    universityId: "nile",
    period: "session",
    requestedAtLabel: "2 Oct 2026 (sample)",
    moveInLabel: "As soon as possible (sample)",
    status: "pending",
    statusNote: "Demo status — no message was actually sent.",
    isDemo: true,
  },
];

export const REQUEST_STATUS_META: Record<
  BookingRequest["status"],
  { label: string; tone: "pending" | "info" | "success" | "muted" }
> = {
  pending: { label: "Pending", tone: "pending" },
  reviewing: { label: "Under review", tone: "info" },
  accepted: { label: "Accepted (demo)", tone: "success" },
  declined: { label: "Declined (demo)", tone: "muted" },
};

/** Landlord dashboard placeholder records. */
export const DEMO_LANDLORD = {
  name: "A. Musa (demo landlord)",
  portfolioNote: "Sample portfolio — not a real account",
  listings: [
    {
      propertyId: "abi-jabi-garden-court",
      status: "Live" as const,
      viewsNote: "412 views (sample figure)",
      enquiriesNote: "9 enquiries (sample figure)",
      occupancy: "3 of 4 units occupied (sample)",
    },
    {
      propertyId: "abi-wuye-shared-loft",
      status: "Live" as const,
      viewsNote: "208 views (sample figure)",
      enquiriesNote: "4 enquiries (sample figure)",
      occupancy: "6 of 8 beds occupied (sample)",
    },
    {
      propertyId: "bze-gudu-shared-house",
      status: "Fully booked" as const,
      viewsNote: "365 views (sample figure)",
      enquiriesNote: "11 enquiries (sample figure)",
      occupancy: "12 of 12 beds occupied (sample)",
    },
    {
      propertyId: "abi-karu-private-room",
      status: "Draft" as const,
      viewsNote: "—",
      enquiriesNote: "—",
      occupancy: "Not published (sample)",
    },
  ],
  enquiries: [
    {
      id: "enq-1",
      fromLabel: "Student demo account",
      propertyId: "abi-jabi-garden-court",
      message: "Is the remaining spot still available for this semester? (sample message)",
      whenLabel: "2 days ago (sample)",
    },
    {
      id: "enq-2",
      fromLabel: "Student demo account",
      propertyId: "bze-gudu-shared-house",
      message: "Any chance a bed opens up next trimester? (sample message)",
      whenLabel: "5 days ago (sample)",
    },
    {
      id: "enq-3",
      fromLabel: "Student demo account",
      propertyId: "abi-wuye-shared-loft",
      message: "Do you allow a friend to visit overnight? (sample message)",
      whenLabel: "1 week ago (sample)",
    },
  ],
  summary: [
    { label: "Live listings", value: "2", note: "Sample figure" },
    { label: "Occupancy", value: "83%", note: "Sample figure" },
    { label: "New enquiries", value: "3", note: "Sample figure" },
    { label: "Response rate", value: "96%", note: "Sample figure — not measured" },
  ],
};
