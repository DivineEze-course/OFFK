import type { University } from "../types/university";

/**
 * DEMO DATA — everything in this file is sample data for the OFFK template.
 *
 * Coordinates are *approximate campus-area pins* used to anchor the schematic
 * demo map. They are not survey-grade campus boundaries, and every distance in
 * the app is labelled as illustrative (straight-line) rather than measured.
 *
 * Adding a university = appending one object here. Rental periods, session
 * maths and area labels all flow from this data into the UI automatically.
 */
export const UNIVERSITIES: University[] = [
  {
    id: "nile",
    name: "Nile University of Nigeria",
    shortName: "Nile University",
    city: "Abuja",
    state: "FCT",
    blurb: "Private university on the Airport Road corridor with a large off-campus student market.",
    about:
      "Nile University sits along Abuja's Airport Road corridor. In this demo model, rent is priced per semester and a full academic session equals two semesters. Popular demo areas include Jabi, Katampe, Wuye and Life Camp.",
    // Approximate campus-area pin (demo). Not a precise boundary.
    coords: { lat: 9.00651, lng: 7.52882 },
    coordinateNote:
      "Approximate campus-area pin used for this demo. Explore the real campus on an external map service for exact locations.",
    rentalPeriods: [
      {
        id: "semester",
        label: "Per semester",
        shortLabel: "Semester",
        note: "Rent quoted for one semester in this demo model.",
      },
      {
        id: "session",
        label: "Full academic session",
        shortLabel: "Session",
        note: "Demo model: one session = 2 semesters, unless a listing states its own session terms.",
      },
    ],
    sessionPeriods: {
      basePeriod: "semester",
      count: 2,
      explanation:
        "In this demo pricing model a full academic session at Nile University equals 2 semesters (sessionPrice = semesterPrice × 2). Real landlords may offer their own discounts, so listings can define an explicit session price.",
    },
    areas: ["Jabi", "Katampe", "Wuye", "Life Camp", "Karu", "Gwarinpa"],
    image: { src: "/images/universities/nile.svg", alt: "Illustration of a campus-area apartment block near the Nile University demo pin" },
    monogram: "NU",
  },
  {
    id: "baze",
    name: "Baze University",
    shortName: "Baze University",
    city: "Abuja",
    state: "FCT",
    blurb: "Private university with a trimester-based academic structure in this demo model.",
    about:
      "Baze University follows a trimester-based structure in this demo. Rent is quoted per trimester; a full session is modelled as 3 trimesters, though individual listings may define different session terms. Popular demo areas include Gudu, Apo, Kuje and Jabi.",
    // Approximate campus-area pin (demo). Not a precise boundary.
    coords: { lat: 8.99924, lng: 7.56478 },
    coordinateNote:
      "Approximate campus-area pin used for this demo. Explore the real campus on an external map service for exact locations.",
    rentalPeriods: [
      {
        id: "trimester",
        label: "Per trimester",
        shortLabel: "Trimester",
        note: "Rent quoted for one trimester — Baze's demo academic period.",
      },
      {
        id: "session",
        label: "Full academic session",
        shortLabel: "Session",
        note: "Demo model: one session = 3 trimesters, unless a listing states its own session terms.",
      },
    ],
    sessionPeriods: {
      basePeriod: "trimester",
      count: 3,
      explanation:
        "In this demo pricing model a full academic session at Baze University equals 3 trimesters (sessionPrice = trimesterPrice × 3). A trimester is not the same as a semester. Listings may define an explicit session price where their actual rental terms differ.",
    },
    areas: ["Gudu", "Apo", "Kuje", "Jabi", "Wuye"],
    image: { src: "/images/universities/baze.svg", alt: "Illustration of a property corridor representing demo accommodation near Baze University" },
    monogram: "BU",
  },
];

export const DEFAULT_UNIVERSITY_ID = "nile";

export function getUniversity(id: string | undefined): University {
  return UNIVERSITIES.find((u) => u.id === id) ?? UNIVERSITIES[0];
}

export function isUniversityId(id: string | undefined): id is string {
  return UNIVERSITIES.some((u) => u.id === id);
}
