"use client";

import type { LatLng } from "@/types/university";

/**
 * Google Maps Platform integration.
 *
 * The browser key is read from `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. It must be
 * restricted in Google Cloud to the Maps JavaScript API, Places API and Routes
 * API, and to the deployment origins. No key is committed or defaulted.
 *
 * When the key is absent, every component shows an explicit configuration
 * notice. Nothing in this module fabricates a route, coordinate or travel time.
 */

export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
export const GOOGLE_MAPS_CONFIGURED = GOOGLE_MAPS_KEY.length > 0;

let loaderPromise: Promise<typeof google> | null = null;

/** Loads the Maps JavaScript API once, with Places and Geometry. */
export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }
  if (!GOOGLE_MAPS_CONFIGURED) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured."));
  }
  if (window.google?.maps) return Promise.resolve(window.google);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<typeof google>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-offk-google-maps="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.google?.maps) resolve(window.google);
        else reject(new Error("Google Maps loaded without the expected API."));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Google Maps JavaScript API failed to load.")),
      );
      return;
    }

    const callbackName = "__offkGoogleMapsReady";
    const globalWindow = window as unknown as Record<string, unknown>;
    globalWindow[callbackName] = () => {
      delete globalWindow[callbackName];
      if (window.google?.maps) resolve(window.google);
      else reject(new Error("Google Maps loaded without the expected API."));
    };

    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}` +
      `&libraries=places,geometry&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.dataset.offkGoogleMaps = "true";
    script.onerror = () => reject(new Error("Google Maps JavaScript API failed to load."));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export interface RoadRoute {
  distanceKm: number;
  durationMinutes: number;
  encodedPolyline: string;
}

interface RoutesResponse {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
    polyline?: { encodedPolyline?: string };
  }>;
  error?: { message?: string; status?: string };
}

/**
 * Calls the Google Routes API directly from the browser using the restricted
 * public key. The caller must only show these numbers after this succeeds.
 */
export async function fetchRoadRoute({
  origin,
  destination,
  travelMode,
}: {
  origin: LatLng;
  destination: LatLng;
  travelMode: "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT";
}): Promise<RoadRoute> {
  if (!GOOGLE_MAPS_CONFIGURED) {
    throw new Error("Google Routes is not configured (missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).");
  }

  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_KEY,
      "X-Goog-FieldMask":
        "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: {
        location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
      },
      destination: {
        location: { latLng: { latitude: destination.lat, longitude: destination.lng } },
      },
      travelMode,
      routingPreference: travelMode === "DRIVE" ? "TRAFFIC_AWARE" : "ROUTING_PREFERENCE_UNSPECIFIED",
      computeAlternativeRoutes: false,
      languageCode: "en-NG",
      units: "METRIC",
    }),
  });

  let payload: RoutesResponse = {};
  try {
    payload = (await response.json()) as RoutesResponse;
  } catch {
    // Keep the HTTP failure below; the response body was not JSON.
  }

  if (!response.ok) {
    const detail = payload.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Routes API request failed: ${detail}`);
  }

  const route = payload.routes?.[0];
  if (!route || route.distanceMeters == null || !route.duration) {
    throw new Error("Routes API returned no route for these two pins.");
  }

  const durationSeconds = Number(route.duration.replace(/s$/, ""));
  if (!Number.isFinite(durationSeconds)) {
    throw new Error("Routes API returned an unreadable duration.");
  }

  return {
    distanceKm: route.distanceMeters / 1000,
    durationMinutes: durationSeconds / 60,
    encodedPolyline: route.polyline?.encodedPolyline ?? "",
  };
}

/** Decoder for the encoded polyline returned by the Routes API. */
export function decodePolyline(encoded: string): LatLng[] {
  if (!encoded) return [];
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

export function googleDirectionsUrl({
  origin,
  destination,
  travelMode = "driving",
}: {
  origin: LatLng;
  destination: LatLng;
  travelMode?: "driving" | "walking" | "bicycling" | "transit";
}): string {
  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: travelMode,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export const GOOGLE_SETUP_NOTE =
  "Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local, enable Maps JavaScript API, Places API and Routes API, and restrict the browser key to this origin. No map, place search or road route is live until then.";
