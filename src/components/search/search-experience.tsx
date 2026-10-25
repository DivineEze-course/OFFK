"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import type { AccommodationTypeId, AmenityId, FurnishingLevel } from "@/types/property";
import type { Property } from "@/types/property";
import type { RentalPeriodId, University } from "@/types/university";
import { AMENITIES, ACCOMMODATION_TYPES, FURNISHING_LEVELS } from "@/data/meta";
import { areasWithCounts } from "@/data/properties";
import {
  AREA_ANY,
  EMPTY_FILTERS,
  FURNISHING_ANY,
  SORT_OPTIONS,
  filterProperties,
  sortProperties,
  type SearchFilters,
} from "@/lib/filters";
import { useUniversity } from "@/components/university/university-provider";
import { getUniversity } from "@/data/universities";
import { UniversityPicker } from "@/components/university/university-picker";
import { PeriodToggle } from "@/components/search/period-toggle";
import { PropertyGrid } from "@/components/properties/property-card";
import { EmptyState } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { SelectInput, TextInput, CheckboxRow, Field } from "@/components/ui/field";
import { buttonClasses, Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format-currency";
import { cn } from "@/lib/cn";

const BUDGET_STEPS = [200_000, 400_000, 600_000, 800_000, 1_200_000, 2_000_000] as const;
const DISTANCE_STEPS = [1, 2, 3, 5, 8, 12] as const;

/**
 * Client-side search experience over the demo dataset.
 *
 * Filter state lives here (plus the global university/period context) and is
 * mirrored into the URL query string so results are shareable and the browser
 * back button behaves the way people expect.
 */
export function SearchExperience({
  initialFilters,
  properties,
}: {
  initialFilters: Partial<SearchFilters>;
  properties: Property[];
}) {
  const { university, period, setUniversityId, setPeriod } = useUniversity();
  const [filters, setFilters] = useState<SearchFilters>({
    ...EMPTY_FILTERS,
    ...initialFilters,
  });
  const [panelOpen, setPanelOpen] = useState(false);

  // Shared links carry university + period; adopt them once, after the global
  // provider has hydrated from storage, so a link always reproduces its results.
  const adoptedParams = useRef(false);
  useEffect(() => {
    if (adoptedParams.current) return;
    adoptedParams.current = true;
    const params = new URLSearchParams(window.location.search);
    const universityParam = params.get("university");
    const periodParam = params.get("period");

    if (universityParam) setUniversityId(universityParam);
    if (periodParam) {
      // Adopt the period only if it is valid for the adopted university,
      // otherwise the provider keeps its default and results stay priced.
      const resolved = getUniversity(universityParam ?? undefined);
      if (resolved.rentalPeriods.some((option) => option.id === periodParam)) {
        setPeriod(periodParam as RentalPeriodId);
      }
    }
  }, [setUniversityId, setPeriod]);

  // Keeps typing snappy on larger demo datasets.
  const query = useDeferredValue(filters.query);

  const resolved: SearchFilters = useMemo(() => ({ ...filters, query }), [filters, query]);

  const results = useMemo(() => {
    const filtered = filterProperties(properties, resolved, university, period);
    return sortProperties(filtered, resolved.sort, university);
  }, [properties, resolved, university, period]);

  const areas = useMemo(() => areasWithCounts(), []);

  const update = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      syncToUrl(next);
      return next;
    });
  }, []);

  const toggleInArray = useCallback(
    <K extends "types" | "amenities">(key: K, value: AccommodationTypeId | AmenityId) => {
      setFilters((current) => {
        const list = current[key] as string[];
        const next: SearchFilters = {
          ...current,
          [key]: list.includes(value)
            ? list.filter((entry) => entry !== value)
            : [...list, value],
        };
        syncToUrl(next);
        return next;
      });
    },
    [],
  );

  const clearAll = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS, sort: filters.sort });
    syncToUrl({ ...EMPTY_FILTERS, sort: filters.sort });
  }, [filters.sort]);

  const activeChips = useMemo(
    () => buildActiveChips(filters, update, toggleInArray),
    [filters, update, toggleInArray],
  );

  return (
    <div className="page-container py-10 lg:py-14">
      {/* ---------------------------------------------------------------
          Search header: university, period and query.
          --------------------------------------------------------------- */}
      <header className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              Search accommodation
            </p>
            <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Sample listings for {university.shortName}
            </h1>
          </div>
          <p className="text-sm text-muted">
            <span className="font-display text-xl font-bold text-ink">{results.length}</span>{" "}
            {results.length === 1 ? "result" : "results"}
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <UniversityPicker size="sm" />
            <PeriodToggle />
          </div>

          <div className="flex items-end gap-2">
            <Field label="Keywords" htmlFor="search-query" className="flex-1 lg:w-72">
              <TextInput
                id="search-query"
                type="search"
                placeholder="Area, tag or listing name"
                value={filters.query}
                onChange={(event) => update("query", event.target.value)}
              />
            </Field>
            <button
              type="button"
              onClick={() => setPanelOpen((open) => !open)}
              aria-expanded={panelOpen}
              className={buttonClasses(
                panelOpen ? "primary" : "outline",
                "md",
                "lg:hidden h-11 shrink-0",
              )}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filters
            </button>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[17rem_1fr]">
        {/* ------------------------------------------------------------
            Filter rail / collapsible sheet.
            ------------------------------------------------------------ */}
        <aside
          id="search-filters"
          className={cn(
            "lg:sticky lg:top-24 lg:block lg:self-start",
            panelOpen ? "block" : "hidden",
          )}
          aria-label="Filter results"
        >
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">Filters</h2>
              {activeChips.length > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-medium text-muted underline underline-offset-2 hover:text-ink"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <div className="mt-5 space-y-6">
              <Field label="Area" htmlFor="filter-area">
                <SelectInput
                  id="filter-area"
                  value={filters.area}
                  onChange={(event) => update("area", event.target.value)}
                >
                  <option value={AREA_ANY}>Any area</option>
                  {areas.map((entry) => (
                    <option key={entry.area} value={entry.area}>
                      {entry.area} ({entry.count})
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <fieldset>
                <legend className="text-sm font-medium text-ink">Budget ({budgetPeriodLabel(period, university.rentalPeriods)})</legend>
                <div className="mt-2 space-y-3">
                  <SelectInput
                    aria-label="Minimum budget"
                    value={filters.minBudget ?? ""}
                    onChange={(event) =>
                      update("minBudget", event.target.value === "" ? null : Number(event.target.value))
                    }
                  >
                    <option value="">No minimum</option>
                    {BUDGET_STEPS.map((amount) => (
                      <option key={amount} value={amount}>
                        From {formatNaira(amount)}
                      </option>
                    ))}
                  </SelectInput>
                  <SelectInput
                    aria-label="Maximum budget"
                    value={filters.maxBudget ?? ""}
                    onChange={(event) =>
                      update("maxBudget", event.target.value === "" ? null : Number(event.target.value))
                    }
                  >
                    <option value="">No maximum</option>
                    {BUDGET_STEPS.map((amount) => (
                      <option key={amount} value={amount}>
                        Up to {formatNaira(amount)}
                      </option>
                    ))}
                  </SelectInput>
                </div>
                <p className="mt-2 text-xs text-faint">
                  Budget matches against a listing&apos;s cheapest available price for{" "}
                  {university.shortName}.
                </p>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-medium text-ink">Accommodation type</legend>
                <div className="mt-3 space-y-2.5">
                  {ACCOMMODATION_TYPES.map((type) => (
                    <CheckboxRow
                      key={type.id}
                      id={`type-${type.id}`}
                      label={type.label}
                      description={type.description}
                      checked={filters.types.includes(type.id)}
                      onChange={() => toggleInArray("types", type.id)}
                    />
                  ))}
                </div>
              </fieldset>

              <Field label="Furnishing" htmlFor="filter-furnishing">
                <SelectInput
                  id="filter-furnishing"
                  value={filters.furnishing}
                  onChange={(event) => update("furnishing", event.target.value as FurnishingLevel | "all")}
                >
                  <option value={FURNISHING_ANY}>Any furnishing</option>
                  {FURNISHING_LEVELS.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field
                label="Max straight-line distance"
                htmlFor="filter-distance"
                hint="Illustrative straight-line estimate, not travel distance."
              >
                <SelectInput
                  id="filter-distance"
                  value={filters.maxDistanceKm ?? ""}
                  onChange={(event) =>
                    update("maxDistanceKm", event.target.value === "" ? null : Number(event.target.value))
                  }
                >
                  <option value="">Any distance</option>
                  {DISTANCE_STEPS.map((km) => (
                    <option key={km} value={km}>
                      Within {km} km straight-line
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <fieldset>
                <legend className="text-sm font-medium text-ink">Amenities</legend>
                <div className="mt-3 space-y-2.5">
                  {AMENITIES.map((amenity) => (
                    <CheckboxRow
                      key={amenity.id}
                      id={`amenity-${amenity.id}`}
                      label={amenity.label}
                      checked={filters.amenities.includes(amenity.id)}
                      onChange={() => toggleInArray("amenities", amenity.id)}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------------
            Results.
            ------------------------------------------------------------ */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="no-scrollbar -mx-1 flex max-w-full gap-2 overflow-x-auto px-1 py-0.5">
              {activeChips.length > 0 ? (
                activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.clear}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-2"
                  >
                    {chip.label}
                    <X className="size-3" aria-hidden="true" />
                    <span className="sr-only">Remove filter</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted">
                  Showing every demo listing that serves {university.shortName} for the selected period.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-xs font-medium text-muted">
                Sort
              </label>
              <div className="w-52">
                <SelectInput
                  id="sort-by"
                  value={filters.sort}
                  onChange={(event) =>
                    update("sort", event.target.value as SearchFilters["sort"])
                  }
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </SelectInput>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {results.length > 0 ? (
              <PropertyGrid properties={results} />
            ) : (
              <EmptyState
                icon={<SearchX className="size-8" aria-hidden="true" />}
                title="No sample listings match those filters"
                description="Try widening the budget, removing an amenity, or switching rental period — the demo dataset is deliberately small."
                action={{ label: "Clear all filters", href: "/properties" }}
              />
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <Badge tone="neutral">Demo dataset · {properties.length} fictional listings</Badge>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Reset filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Human label for the budget fieldset legend, e.g. "semester". */
function budgetPeriodLabel(
  period: RentalPeriodId,
  options: University["rentalPeriods"],
): string {
  return options.find((option) => option.id === period)?.shortLabel.toLowerCase() ?? "period";
}

/**
 * Mirrors filter state into the query string without a navigation round-trip.
 * Existing `university` / `period` params are preserved so shared links keep
 * quoting results in the right calendar.
 */
function syncToUrl(filters: SearchFilters) {
  const params = new URLSearchParams(window.location.search);
  for (const key of ["q", "area", "min", "max", "type", "furnishing", "amenities", "distance", "sort"]) {
    params.delete(key);
  }

  if (filters.query) params.set("q", filters.query);
  if (filters.area !== AREA_ANY) params.set("area", filters.area);
  if (filters.minBudget != null) params.set("min", String(filters.minBudget));
  if (filters.maxBudget != null) params.set("max", String(filters.maxBudget));
  if (filters.types.length > 0) params.set("type", filters.types.join(","));
  if (filters.furnishing !== FURNISHING_ANY) params.set("furnishing", filters.furnishing);
  if (filters.amenities.length > 0) params.set("amenities", filters.amenities.join(","));
  if (filters.maxDistanceKm != null) params.set("distance", String(filters.maxDistanceKm));
  if (filters.sort !== "recommended") params.set("sort", filters.sort);

  const query = params.toString();
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

interface ActiveChip {
  key: string;
  label: string;
  clear: () => void;
}

function buildActiveChips(
  filters: SearchFilters,
  update: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void,
  toggleInArray: <K extends "types" | "amenities">(
    key: K,
    value: AccommodationTypeId | AmenityId,
  ) => void,
): ActiveChip[] {
  const chips: ActiveChip[] = [];

  if (filters.query) {
    chips.push({ key: "q", label: `“${filters.query}”`, clear: () => update("query", "") });
  }
  if (filters.area !== AREA_ANY) {
    chips.push({ key: "area", label: filters.area, clear: () => update("area", AREA_ANY) });
  }
  if (filters.minBudget != null) {
    chips.push({
      key: "min",
      label: `From ${formatNaira(filters.minBudget)}`,
      clear: () => update("minBudget", null),
    });
  }
  if (filters.maxBudget != null) {
    chips.push({
      key: "max",
      label: `Up to ${formatNaira(filters.maxBudget)}`,
      clear: () => update("maxBudget", null),
    });
  }
  for (const type of filters.types) {
    chips.push({
      key: `type-${type}`,
      label: ACCOMMODATION_TYPES.find((entry) => entry.id === type)?.label ?? type,
      clear: () => toggleInArray("types", type),
    });
  }
  if (filters.furnishing !== FURNISHING_ANY) {
    chips.push({
      key: "furnishing",
      label:
        FURNISHING_LEVELS.find((entry) => entry.id === filters.furnishing)?.label ??
        filters.furnishing,
      clear: () => update("furnishing", FURNISHING_ANY),
    });
  }
  if (filters.maxDistanceKm != null) {
    chips.push({
      key: "distance",
      label: `Within ${filters.maxDistanceKm} km straight-line`,
      clear: () => update("maxDistanceKm", null),
    });
  }
  for (const amenity of filters.amenities) {
    chips.push({
      key: `amenity-${amenity}`,
      label: AMENITIES.find((entry) => entry.id === amenity)?.label ?? amenity,
      clear: () => toggleInArray("amenities", amenity),
    });
  }

  return chips;
}
