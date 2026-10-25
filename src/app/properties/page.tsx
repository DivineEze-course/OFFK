import type { Metadata } from "next";
import { Suspense } from "react";
import { PROPERTIES } from "@/data/properties";
import { AREA_ANY, FURNISHING_ANY, SORT_OPTIONS, type SearchFilters, type SortId } from "@/lib/filters";
import { SearchExperience } from "@/components/search/search-experience";
import type { AccommodationTypeId, AmenityId, FurnishingLevel } from "@/types/property";

export const metadata: Metadata = {
  title: "Search accommodation",
  description:
    "Filter off-campus student accommodation demo listings by university, rental period, area, budget, amenities and straight-line distance.",
};

const VALID_TYPES: AccommodationTypeId[] = [
  "shared-room",
  "private-room",
  "studio",
  "one-bedroom",
  "shared-apartment",
  "two-bedroom",
];

const VALID_FURNISHING: FurnishingLevel[] = ["furnished", "semi-furnished", "unfurnished"];

const VALID_AMENITIES: AmenityId[] = [
  "wifi",
  "power",
  "generator",
  "water",
  "furnished",
  "kitchen",
  "private-bathroom",
  "shared-bathroom",
  "security",
  "cctv",
  "parking",
  "laundry",
  "air-conditioning",
  "study-area",
  "borehole",
];

function parseIntParam(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseList<T extends string>(value: string | null | undefined, allowed: readonly T[]): T[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry): entry is T => (allowed as readonly string[]).includes(entry));
}

/**
 * Reads (and validates) shareable search params on the server, then hands a
 * pristine filter object to the client search experience. Anything invalid in
 * the URL falls back to the empty filter rather than breaking the page.
 */
function filtersFromSearchParams(params: Record<string, string | string[] | undefined>): Partial<SearchFilters> {
  const get = (key: string): string | undefined => {
    const raw = params[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  const sort = get("sort");
  const furnishing = get("furnishing");

  return {
    query: get("q") ?? "",
    area: get("area") ?? AREA_ANY,
    minBudget: parseIntParam(get("min")),
    maxBudget: parseIntParam(get("max")),
    types: parseList(get("type"), VALID_TYPES),
    furnishing:
      furnishing && VALID_FURNISHING.includes(furnishing as FurnishingLevel)
        ? (furnishing as FurnishingLevel)
        : FURNISHING_ANY,
    amenities: parseList(get("amenities"), VALID_AMENITIES),
    maxDistanceKm: parseIntParam(get("distance")),
    sort:
      sort && SORT_OPTIONS.some((option) => option.id === sort)
        ? (sort as SortId)
        : "recommended",
  };
}

export default function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    // `searchParams` is an uncached dynamic read: isolate it behind Suspense so
    // the shell of the search page can still be prerendered and streamed.
    <Suspense fallback={<SearchSkeleton />}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <SearchExperience
      initialFilters={filtersFromSearchParams(params ?? {})}
      properties={PROPERTIES}
    />
  );
}

/** Static placeholder shown while the query string resolves. */
function SearchSkeleton() {
  return (
    <div className="page-container py-10 lg:py-14" aria-busy="true">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="h-3 w-40 animate-pulse rounded bg-surface-2" />
        <div className="mt-3 h-7 w-72 animate-pulse rounded bg-surface-2" />
        <div className="mt-5 h-10 w-full max-w-md animate-pulse rounded-lg bg-surface-2" />
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[17rem_1fr]">
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-surface" />
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-4/3 animate-pulse rounded-xl bg-surface-2" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
