/**
 * Straight-line ("as the crow flies") distance between two coordinates.
 *
 * Uses the Haversine formula with Earth's mean radius. The result is a
 * straight-line distance only — it must never be presented as road or travel
 * distance. No routing service is used anywhere in this demo.
 */
import type { LatLng } from "../types/university";

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** "1.8 km" / "850 m" — used for straight-line labels throughout the UI. */
export function formatStraightLineDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Illustrative straight-line distance between a campus-area pin and a demo
 * listing pin. Both pins are demo constructs — the UI must always label this
 * as an illustrative straight-line estimate, never as travel distance.
 */
export function illustrativeStraightLineKm(
  campusPin: LatLng,
  propertyPin: LatLng,
): number {
  return haversineKm(campusPin, propertyPin);
}
