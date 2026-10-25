/**
 * Client-side search, filter and sort pipeline over the demo dataset.
 * Pure functions only — no React, no data imports.
 */
import type { AccommodationTypeId, AmenityId, FurnishingLevel, Property } from "../types/property";
import type { RentalPeriodId, University } from "../types/university";
import { haversineKm } from "./distance";
import { fromPrice, priceForPeriod } from "./pricing";

export type SortId = "recommended" | "price-asc" | "price-desc" | "closest";

export interface SortOption {
  id: SortId;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: "recommended", label: "Recommended" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "closest", label: "Closest to campus" },
];

export interface SearchFilters {
  /** Text query matched against title, area and tags. */
  query: string;
  area: string;
  minBudget: number | null;
  maxBudget: number | null;
  types: AccommodationTypeId[];
  furnishing: FurnishingLevel | "all";
  amenities: AmenityId[];
  maxDistanceKm: number | null;
  sort: SortId;
}

export const AREA_ANY = "all";
export const FURNISHING_ANY = "all";

export const EMPTY_FILTERS: SearchFilters = {
  query: "",
  area: AREA_ANY,
  minBudget: null,
  maxBudget: null,
  types: [],
  furnishing: FURNISHING_ANY,
  amenities: [],
  maxDistanceKm: null,
  sort: "recommended",
};

/** Straight-line km between the campus pin and a demo listing pin. */
export function distanceFromCampus(property: Property, university: University): number {
  return haversineKm(university.coords, property.coords);
}

/**
 * A listing is *searchable* for a university/period pair when it serves that
 * university and actually resolves a price for the active rental period.
 * Listings that don't are excluded rather than shown with an invented price.
 */
export function matchesUniversityAndPeriod(
  property: Property,
  university: University,
  period: RentalPeriodId,
): boolean {
  return (
    property.universityIds.includes(university.id) &&
    priceForPeriod(property, period, university) != null
  );
}

export function filterProperties(
  properties: Property[],
  filters: SearchFilters,
  university: University,
  period: RentalPeriodId,
): Property[] {
  const query = filters.query.trim().toLowerCase();

  return properties.filter((property) => {
    if (!matchesUniversityAndPeriod(property, university, period)) return false;

    if (query) {
      const haystack = [property.title, property.area, ...property.tags].join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.area !== AREA_ANY && property.area !== filters.area) return false;
    if (filters.types.length > 0 && !filters.types.includes(property.type)) return false;
    if (filters.furnishing !== FURNISHING_ANY && property.furnishing !== filters.furnishing) return false;
    if (
      filters.amenities.length > 0 &&
      !filters.amenities.every((amenity) => property.amenities.includes(amenity))
    ) {
      return false;
    }

    // Budget is evaluated against the cheapest price this listing resolves for
    // the university (any of its rental periods).
    if (filters.minBudget != null || filters.maxBudget != null) {
      const price = fromPrice(property, university);
      if (!price) return false;
      if (filters.minBudget != null && price.amount < filters.minBudget) return false;
      if (filters.maxBudget != null && price.amount > filters.maxBudget) return false;
    }

    if (filters.maxDistanceKm != null && distanceFromCampus(property, university) > filters.maxDistanceKm) {
      return false;
    }

    return true;
  });
}

export function sortProperties(
  properties: Property[],
  sort: SortId,
  university: University,
): Property[] {
  const list = [...properties];
  const priceOf = (property: Property) => fromPrice(property, university)?.amount ?? Infinity;

  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => priceOf(a) - priceOf(b));
    case "price-desc":
      return list.sort((a, b) => priceOf(b) - priceOf(a));
    case "closest":
      return list.sort(
        (a, b) => distanceFromCampus(a, university) - distanceFromCampus(b, university),
      );
    case "recommended":
    default:
      return list.sort((a, b) => recommendationScore(b, university) - recommendationScore(a, university));
  }
}

/** Lightweight demo ranking: verified + available + tagged listings rise to the top. */
function recommendationScore(property: Property, university: University): number {
  let value = 0;
  if (property.verification === "verified-demo") value += 3;
  if (property.availability.status === "available") value += 3;
  else if (property.availability.status === "limited") value += 1;
  if (property.tags.includes("Popular") || property.tags.includes("Closest to campus")) value += 1;
  const price = fromPrice(property, university);
  if (price) value += Math.max(0, 3 - price.amount / 1_000_000);
  return value;
}
