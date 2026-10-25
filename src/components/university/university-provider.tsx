"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { RentalPeriodId } from "@/types/university";
import { DEFAULT_UNIVERSITY_ID, getUniversity, isUniversityId } from "@/data/universities";
import { createStoredValue, useStoredValue } from "@/lib/stored-value";

interface UniversityContextValue {
  universityId: string;
  university: ReturnType<typeof getUniversity>;
  /** Active rental period, always valid for the selected university. */
  period: RentalPeriodId;
  setUniversityId: (id: string) => void;
  setPeriod: (period: RentalPeriodId) => void;
  /** `false` until persisted state has been read from localStorage. */
  ready: boolean;
}

const UniversityContext = createContext<UniversityContextValue | null>(null);

/**
 * Global "which university am I shopping for?" state. Drives rental periods,
 * prices, distances and the map everywhere in the app. Persisted locally so
 * the choice survives navigation and reloads.
 *
 * Two independent stores (id + period) are reconciled during render: the
 * period is clamped to whichever options the university actually supports,
 * so a stored "semester" never leaks into Baze's trimester model.
 */
const universityStore = createStoredValue<string>({
  key: "offk.university",
  fallback: DEFAULT_UNIVERSITY_ID,
  parse: (raw) => (isUniversityId(raw ?? undefined) ? (raw as string) : DEFAULT_UNIVERSITY_ID),
  serialize: (value) => value,
});

const periodStore = createStoredValue<RentalPeriodId | null>({
  key: "offk.period",
  fallback: null,
  parse: (raw) =>
    raw === "semester" || raw === "trimester" || raw === "session" ? raw : null,
  serialize: (value) => value ?? "",
});

export function UniversityProvider({ children }: { children: React.ReactNode }) {
  const universitySnapshot = useStoredValue(universityStore);
  const periodSnapshot = useStoredValue(periodStore);

  const university = getUniversity(universitySnapshot.value);
  const period =
    periodSnapshot.value && university.rentalPeriods.some((option) => option.id === periodSnapshot.value)
      ? periodSnapshot.value
      : university.rentalPeriods[0].id;

  const ready = universitySnapshot.ready && periodSnapshot.ready;

  const setUniversityId = useCallback((id: string) => {
    const next = getUniversity(isUniversityId(id) ? id : undefined);
    universityStore.write(next.id);
    // Drop back to the new university's default period when the current one
    // isn't part of its rental model (e.g. semester → trimester for Baze).
    const storedPeriod = periodStore.getSnapshot().value;
    if (!next.rentalPeriods.some((option) => option.id === storedPeriod)) {
      periodStore.write(next.rentalPeriods[0].id);
    }
  }, []);

  const setPeriod = useCallback((next: RentalPeriodId) => {
    periodStore.write(next);
  }, []);

  const value = useMemo<UniversityContextValue>(
    () => ({
      universityId: university.id,
      university,
      period,
      setUniversityId,
      setPeriod,
      ready,
    }),
    [university, period, setUniversityId, setPeriod, ready],
  );

  return <UniversityContext.Provider value={value}>{children}</UniversityContext.Provider>;
}

export function useUniversity(): UniversityContextValue {
  const context = useContext(UniversityContext);
  if (!context) throw new Error("useUniversity must be used inside <UniversityProvider>");
  return context;
}
