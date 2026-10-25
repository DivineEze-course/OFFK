"use client";

import { useMemo } from "react";
import type {
  AvailabilityHold,
  Enquiry,
  GroupBooking,
  GroupMember,
  InspectionRequest,
  LandlordDraft,
  LocalListingRecord,
  PaymentRecord,
  RoadRouteResult,
} from "../types/marketplace";
import type { Property } from "../types/property";
import { PROPERTIES, getProperty } from "../data/properties";
import {
  DEMO_STUDENT_ID,
  SEED_ENQUIRIES,
  SEED_GROUPS,
  SEED_HOLDS,
  SEED_INSPECTIONS,
  SEED_PAYMENTS,
} from "../data/marketplace-demo";
import { createStoredValue, useStoredValue } from "./stored-value";
import { roomAvailability } from "./rooms";

export const STORAGE_KEYS = {
  enquiries: "offk.enquiries.v2",
  groups: "offk.groups.v2",
  payments: "offk.payments.v2",
  inspections: "offk.inspections.v2",
  holds: "offk.holds.v2",
  notifications: "offk.notifications.v2",
  routes: "offk.routes.v2",
  localListings: "offk.landlord.listings.v2",
  draft: "offk.landlord.draft.v2",
} as const;

function parseArray<T>(raw: string | null, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function parseObject<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const enquiriesStore = createStoredValue<Enquiry[]>({
  key: STORAGE_KEYS.enquiries,
  fallback: SEED_ENQUIRIES,
  parse: (raw) => parseArray(raw, SEED_ENQUIRIES),
  serialize: JSON.stringify,
});

const groupsStore = createStoredValue<GroupBooking[]>({
  key: STORAGE_KEYS.groups,
  fallback: SEED_GROUPS,
  parse: (raw) => parseArray(raw, SEED_GROUPS),
  serialize: JSON.stringify,
});

const paymentsStore = createStoredValue<PaymentRecord[]>({
  key: STORAGE_KEYS.payments,
  fallback: SEED_PAYMENTS,
  parse: (raw) => parseArray(raw, SEED_PAYMENTS),
  serialize: JSON.stringify,
});

const inspectionsStore = createStoredValue<InspectionRequest[]>({
  key: STORAGE_KEYS.inspections,
  fallback: SEED_INSPECTIONS,
  parse: (raw) => parseArray(raw, SEED_INSPECTIONS),
  serialize: JSON.stringify,
});

const holdsStore = createStoredValue<AvailabilityHold[]>({
  key: STORAGE_KEYS.holds,
  fallback: SEED_HOLDS,
  parse: (raw) => parseArray(raw, SEED_HOLDS),
  serialize: JSON.stringify,
});

const notificationsStore = createStoredValue<
  import("../types/marketplace").AppNotification[]
>({
  key: STORAGE_KEYS.notifications,
  fallback: [],
  parse: (raw) => parseArray(raw, []),
  serialize: JSON.stringify,
});

const routesStore = createStoredValue<RoadRouteResult[]>({
  key: STORAGE_KEYS.routes,
  fallback: [],
  parse: (raw) => parseArray(raw, []),
  serialize: JSON.stringify,
});

const localListingsStore = createStoredValue<LocalListingRecord[]>({
  key: STORAGE_KEYS.localListings,
  fallback: [],
  parse: (raw) => parseArray(raw, []),
  serialize: JSON.stringify,
});

const draftStore = createStoredValue<LandlordDraft | null>({
  key: STORAGE_KEYS.draft,
  fallback: null,
  parse: (raw) => parseObject(raw, null),
  serialize: JSON.stringify,
});

export function createId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function addDaysIso(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/* ------------------------------------------------------------------ *
 * Enquiries
 * ------------------------------------------------------------------ */

export function useEnquiries() {
  return useStoredValue(enquiriesStore);
}

export function addEnquiry(enquiry: Enquiry) {
  const current = enquiriesStore.getSnapshot().value;
  enquiriesStore.write([enquiry, ...current]);
  addNotification({
    audience: "landlord",
    title: "New demo enquiry",
    body: `${enquiry.studentName} enquired about ${enquiry.roomName} at ${enquiry.propertyTitle}.`,
    href: "/landlord",
  });
}

export function updateEnquiry(id: string, patch: Partial<Enquiry>) {
  const current = enquiriesStore.getSnapshot().value;
  enquiriesStore.write(
    current.map((record) =>
      record.id === id ? { ...record, ...patch, updatedAt: new Date().toISOString() } : record,
    ),
  );
}

export function acceptEnquiry(enquiry: Enquiry, response: string) {
  const holdId = createId("hold");
  const bookingRef = `bk-${enquiry.id.replace(/^enq-/, "")}`;
  const deadline = addDaysIso(7);
  const hold: AvailabilityHold = {
    id: holdId,
    propertyId: enquiry.propertyId,
    roomId: enquiry.roomId,
    beds: Math.max(1, enquiry.occupants),
    reason: "accepted-enquiry",
    referenceId: enquiry.id,
    createdAt: new Date().toISOString(),
    expiresAt: deadline,
    status: "active",
    isDemo: true,
  };
  holdsStore.write([hold, ...holdsStore.getSnapshot().value]);
  updateEnquiry(enquiry.id, {
    status: "accepted",
    landlordResponse: response,
    rejectionReason: undefined,
    bookingRef,
    paymentDeadline: deadline,
    holdId,
  });
  addNotification({
    audience: "student",
    title: "Enquiry accepted (demo)",
    body: `${enquiry.roomName} at ${enquiry.propertyTitle} was accepted locally. Payment is still demo-only.`,
    href: "/dashboard",
  });
}

export function rejectEnquiry(enquiry: Enquiry, reason: string) {
  updateEnquiry(enquiry.id, {
    status: "rejected",
    rejectionReason: reason,
    landlordResponse: undefined,
    bookingRef: undefined,
    paymentDeadline: undefined,
    holdId: undefined,
  });
  addNotification({
    audience: "student",
    title: "Enquiry rejected (demo)",
    body: `${enquiry.propertyTitle} was rejected in the local demo. Reason: ${reason}`,
    href: "/dashboard",
  });
}

/* ------------------------------------------------------------------ *
 * Groups
 * ------------------------------------------------------------------ */

export function useGroups() {
  return useStoredValue(groupsStore);
}

export function addGroup(group: GroupBooking) {
  groupsStore.write([group, ...groupsStore.getSnapshot().value]);
}

export function updateGroup(id: string, patch: Partial<GroupBooking>) {
  const current = groupsStore.getSnapshot().value;
  groupsStore.write(
    current.map((group) => (group.id === id ? { ...group, ...patch } : group)),
  );
}

export function updateGroupMember(
  groupId: string,
  memberId: string,
  patch: Partial<GroupMember>,
) {
  const current = groupsStore.getSnapshot().value;
  groupsStore.write(
    current.map((group) =>
      group.id === groupId
        ? {
            ...group,
            members: group.members.map((member) =>
              member.id === memberId ? { ...member, ...patch } : member,
            ),
          }
        : group,
    ),
  );
}

/* ------------------------------------------------------------------ *
 * Demo payments
 * ------------------------------------------------------------------ */

export function usePayments() {
  return useStoredValue(paymentsStore);
}

/**
 * Records a *demo* payment state. It never calls Paystack and never claims a
 * verified payment. The UI labels this as "recorded locally (demo)".
 */
export function recordDemoPayment({
  kind,
  referenceId,
  memberId,
  payerName,
  amount,
  note,
}: {
  kind: PaymentRecord["kind"];
  referenceId: string;
  memberId?: string;
  payerName: string;
  amount: number;
  note?: string;
}): PaymentRecord {
  const payment: PaymentRecord = {
    id: createId("pay"),
    kind,
    referenceId,
    memberId,
    payerName,
    amount,
    status: "paid-demo",
    provider: "demo",
    createdAt: new Date().toISOString(),
    note:
      note ??
      "Demo payment state recorded in this browser only. Paystack is not configured; no payment was taken.",
    isDemo: true,
  };
  paymentsStore.write([payment, ...paymentsStore.getSnapshot().value]);

  if (kind === "group" && memberId) {
    const group = groupsStore.getSnapshot().value.find((entry) => entry.id === referenceId);
    const member = group?.members.find((entry) => entry.id === memberId);
    if (group && member) {
      const paidAmount = member.paidAmount + amount;
      const paymentStatus =
        paidAmount >= group.perMemberAmount ? "paid-demo" : paidAmount > 0 ? "partially-paid" : "unpaid";
      updateGroupMember(referenceId, memberId, { paidAmount, paymentStatus });
      const refreshed = groupsStore
        .getSnapshot()
        .value.find((entry) => entry.id === referenceId);
      if (refreshed) {
        const allPaid = refreshed.members
          .filter((entry) => entry.status === "joined")
          .every((entry) => entry.paymentStatus === "paid-demo");
        updateGroup(referenceId, { status: allPaid ? "full" : refreshed.status });
      }
    }
  }

  if (kind === "enquiry") {
    const enquiry = enquiriesStore
      .getSnapshot()
      .value.find((entry) => entry.id === referenceId);
    if (enquiry) {
      const total = enquiry.quotedTotalAmount ?? amount;
      const existingPaid = paymentsStore
        .getSnapshot()
        .value.filter(
          (entry) =>
            entry.referenceId === referenceId &&
            entry.kind === "enquiry" &&
            entry.status === "paid-demo",
        )
        .reduce((sum, entry) => sum + entry.amount, 0);
      updateEnquiry(referenceId, {
        status: existingPaid >= total ? "fully-paid" : "partially-paid",
      });
    }
  }

  return payment;
}

/* ------------------------------------------------------------------ *
 * Inspections
 * ------------------------------------------------------------------ */

export function useInspections() {
  return useStoredValue(inspectionsStore);
}

export function addInspection(inspection: InspectionRequest) {
  inspectionsStore.write([inspection, ...inspectionsStore.getSnapshot().value]);
}

export function updateInspection(id: string, patch: Partial<InspectionRequest>) {
  const current = inspectionsStore.getSnapshot().value;
  inspectionsStore.write(
    current.map((inspection) =>
      inspection.id === id ? { ...inspection, ...patch } : inspection,
    ),
  );
}

/* ------------------------------------------------------------------ *
 * Holds and notifications
 * ------------------------------------------------------------------ */

export function useHolds() {
  return useStoredValue(holdsStore);
}

export function releaseHold(id: string) {
  const current = holdsStore.getSnapshot().value;
  holdsStore.write(
    current.map((hold) => (hold.id === id ? { ...hold, status: "released" } : hold)),
  );
}

export function useNotifications() {
  return useStoredValue(notificationsStore);
}

export function addNotification(input: {
  audience: "student" | "landlord";
  title: string;
  body: string;
  href?: string;
}) {
  const notification = {
    id: createId("notif"),
    audience: input.audience,
    title: input.title,
    body: input.body,
    createdAt: new Date().toISOString(),
    read: false,
    href: input.href,
    isDemo: true as const,
  };
  notificationsStore.write([notification, ...notificationsStore.getSnapshot().value]);
}

/* ------------------------------------------------------------------ *
 * Landlord listings and drafts
 * ------------------------------------------------------------------ */

export function useLocalListings() {
  return useStoredValue(localListingsStore);
}

export function usePublishedProperties(): { properties: Property[]; ready: boolean } {
  const local = useStoredValue(localListingsStore);
  return useMemo(() => {
    const published = local.value
      .filter((record) => record.status === "published-demo")
      .map((record) => record.property)
      .filter((property) => property.listingStatus === "published");
    return {
      properties: [...published, ...PROPERTIES],
      ready: local.ready,
    };
  }, [local]);
}

export function saveLocalListing(record: LocalListingRecord) {
  const current = localListingsStore.getSnapshot().value;
  const index = current.findIndex((entry) => entry.property.id === record.property.id);
  const next = [...current];
  if (index >= 0) next[index] = record;
  else next.unshift(record);
  localListingsStore.write(next);
}

export function removeLocalListing(propertyId: string) {
  localListingsStore.write(
    localListingsStore
      .getSnapshot()
      .value.filter((record) => record.property.id !== propertyId),
  );
}

export function setLocalListingStatus(
  propertyId: string,
  status: LocalListingRecord["status"],
) {
  const current = localListingsStore.getSnapshot().value;
  localListingsStore.write(
    current.map((record) =>
      record.property.id === propertyId
        ? {
            ...record,
            status,
            property: {
              ...record.property,
              listingStatus:
                status === "published-demo"
                  ? "published"
                  : status === "paused"
                    ? "paused"
                    : "draft",
            },
          }
        : record,
    ),
  );
}

export function useDraft() {
  return useStoredValue(draftStore);
}

export function writeDraft(draft: LandlordDraft | null) {
  draftStore.write(draft);
}

export function getPropertyFromAnywhere(
  id: string,
  local: LocalListingRecord[],
): Property | undefined {
  return local.find((record) => record.property.id === id)?.property ?? getProperty(id);
}

/* ------------------------------------------------------------------ *
 * Route cache
 * ------------------------------------------------------------------ */

export function useRouteCache() {
  return useStoredValue(routesStore);
}

export function saveRoute(route: RoadRouteResult) {
  const current = routesStore.getSnapshot().value.filter((entry) => entry.key !== route.key);
  routesStore.write([route, ...current]);
}

export function routeKey(
  propertyId: string,
  universityId: string,
  travelMode: RoadRouteResult["travelMode"],
): string {
  return `${propertyId}:${universityId}:${travelMode}`;
}

/** Live-ish room view used by dashboards without mutating stored inventory. */
export function roomSpacesFor(property: Property, roomId: string): number {
  const room = property.rooms.find((entry) => entry.id === roomId);
  return room ? roomAvailability(room).availableBeds : 0;
}

export { DEMO_STUDENT_ID };
