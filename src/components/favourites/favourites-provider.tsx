"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { createStoredValue, useStoredValue } from "@/lib/stored-value";

interface FavouritesContextValue {
  ids: ReadonlySet<string>;
  /** `false` until localStorage has been read — avoids count flicker. */
  ready: boolean;
  isFavourite: (id: string) => boolean;
  toggleFavourite: (id: string) => void;
  clearFavourites: () => void;
  count: number;
}

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

/**
 * Demo favourites — persisted in this browser only, never synced anywhere.
 *
 * Backed by an external store (`useSyncExternalStore`) rather than
 * useState + useEffect, so hydration stays deterministic and cross-tab `storage`
 * events propagate for free.
 */
const favouritesStore = createStoredValue<string[]>({
  key: "offk.favourites",
  fallback: [],
  parse: (raw) => {
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((entry): entry is string => typeof entry === "string")
        : [];
    } catch {
      // A corrupt localStorage value should never break the app.
      return [];
    }
  },
  serialize: (value) => JSON.stringify(value),
});

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const { value: ids, ready } = useStoredValue(favouritesStore);

  const toggleFavourite = useCallback((id: string) => {
    const current = favouritesStore.getSnapshot().value;
    favouritesStore.write(
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  }, []);

  const clearFavourites = useCallback(() => {
    favouritesStore.write([]);
  }, []);

  // Derived each render from the snapshot — a Set built twice in one render
  // would be a new reference every time, so it is memoised on the id list.
  const idsSet = useMemo(() => new Set(ids), [ids]);

  const value = useMemo<FavouritesContextValue>(
    () => ({
      ids: idsSet,
      ready,
      isFavourite: (id: string) => idsSet.has(id),
      toggleFavourite,
      clearFavourites,
      count: idsSet.size,
    }),
    [idsSet, ready, toggleFavourite, clearFavourites],
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites(): FavouritesContextValue {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error("useFavourites must be used inside <FavouritesProvider>");
  return context;
}
