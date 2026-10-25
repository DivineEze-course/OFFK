"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

/**
 * The value handed to React. `ready` is `false` on the server and during the
 * hydration render (storage has not been read yet), and `true` from the first
 * client render onwards — replacing the old "setState in an effect" pattern
 * without flashing wrong data.
 */
export interface StoredState<T> {
  value: T;
  ready: boolean;
}

export interface StoredValue<T> {
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => StoredState<T>;
  getServerSnapshot: () => StoredState<T>;
  /** Writes to storage (client only) and notifies every subscriber. */
  write: (value: T) => void;
}

/**
 * A tiny localStorage-backed store for `useSyncExternalStore`.
 *
 * Why not `useState` + `useEffect`? Reading storage in an effect and then
 * calling `setState` causes an extra cascade of renders and trips
 * `react-hooks/set-state-in-effect`. Subscribing to an external store is the
 * pattern React prescribes: the server/hydration snapshot is deterministic,
 * the client snapshot is read synchronously, and updates are propagated
 * without effects.
 *
 * Snapshots are cached so `getSnapshot` returns a stable reference — React
 * re-reads until the reference stops changing.
 */
export function createStoredValue<T>(options: {
  key: string;
  /** Snapshot used on the server and during hydration (storage is unread). */
  fallback: T;
  /** Turns a raw stored string into a value. Falls back on garbage input. */
  parse: (raw: string | null) => T;
  serialize: (value: T) => string;
}): StoredValue<T> {
  const { key, fallback, parse, serialize } = options;

  const listeners = new Set<Listener>();
  const serverState: StoredState<T> = { value: fallback, ready: false };

  let cached: StoredState<T> | null = null;
  /** `undefined` = never read; otherwise the raw string `cached` came from. */
  let cachedRaw: string | null | undefined = undefined;
  let storageListening = false;

  function readRaw(): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // Storage can be unavailable (private mode, disabled cookies).
      return null;
    }
  }

  function buildClientState(): StoredState<T> {
    const raw = readRaw();
    if (cached && cachedRaw === raw) return cached;

    let value = fallback;
    try {
      value = parse(raw);
    } catch {
      value = fallback;
    }
    cached = { value, ready: true };
    cachedRaw = raw;
    return cached;
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function onStorage(event: StorageEvent) {
    // `null` key means "clear" — re-read everything in that case.
    if (event.key !== null && event.key !== key) return;
    cached = null;
    cachedRaw = undefined;
    notify();
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      if (!storageListening && typeof window !== "undefined") {
        storageListening = true;
        window.addEventListener("storage", onStorage);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && storageListening) {
          storageListening = false;
          window.removeEventListener("storage", onStorage);
        }
      };
    },

    getSnapshot() {
      if (typeof window === "undefined") return serverState;
      return buildClientState();
    },

    getServerSnapshot() {
      return serverState;
    },

    write(value: T) {
      const serialized = serialize(value);
      let persisted = true;
      try {
        window.localStorage.setItem(key, serialized);
      } catch {
        persisted = false;
      }
      cached = { value, ready: true };
      cachedRaw = persisted ? serialized : undefined;
      notify();
    },
  };
}

/** Convenience wrapper for components. */
export function useStoredValue<T>(stored: StoredValue<T>): StoredState<T> {
  return useSyncExternalStore(stored.subscribe, stored.getSnapshot, stored.getServerSnapshot);
}
