/**
 * University domain types.
 *
 * The rental model is data-driven: each university declares the rental periods
 * it supports and how many base periods make up one full academic session.
 * Adding a university is a data change only — no UI code needs to know about
 * its specific calendar.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Rental periods supported across the platform.
 * - `semester`   — Nile University (two semesters per demo session)
 * - `trimester`  — Baze University (trimester-based demo model)
 * - `session`    — full academic session at either university
 */
export type RentalPeriodId = "semester" | "trimester" | "session";

export interface RentalPeriodOption {
  id: RentalPeriodId;
  /** Human-readable option label, e.g. "Per semester". */
  label: string;
  /** Compact label used on cards and chips. */
  shortLabel: string;
  /** Plain-language explanation shown next to prices. */
  note: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  blurb: string;
  /** Longer description used on the universities page. */
  about: string;
  /** Primary campus pin. Illustrative-accuracy note lives in `coordinateNote`. */
  coords: LatLng;
  coordinateNote: string;
  /** Ordered rental options shown in every price selector for this university. */
  rentalPeriods: RentalPeriodOption[];
  /**
   * How many base (non-session) periods the demo model counts in one full
   * academic session. Used to derive a session price when a listing does not
   * define one explicitly.
   */
  sessionPeriods: {
    basePeriod: Exclude<RentalPeriodId, "session">;
    count: number;
    /** Explanation rendered on the pricing panel. */
    explanation: string;
  };
  /** Demo areas represented around this campus. */
  areas: string[];
  image: { src: string; alt: string };
  /** Uppercase mark used in the university picker. */
  monogram: string;
}

