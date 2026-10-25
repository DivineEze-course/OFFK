import type { LatLng } from "../types/university";
import { PROPERTIES } from "./properties";

/**
 * Demo locations the landlord can explicitly select when Google Places is not
 * configured. These reuse the illustrative pins already in the seed dataset —
 * they are neighbourhood-level demo points, never verified addresses.
 */
export interface DemoLocationPreset {
  id: string;
  label: string;
  area: string;
  coords: LatLng;
  note: string;
}

const seen = new Set<string>();
export const DEMO_LOCATION_PRESETS: DemoLocationPreset[] = PROPERTIES.filter((property) => {
  if (seen.has(property.area)) return false;
  seen.add(property.area);
  return true;
}).map((property) => ({
  id: `demo-location-${property.area.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  label: `${property.area} (demo neighbourhood pin)`,
  area: property.area,
  coords: property.coords,
  note: "Illustrative demo pin from the sample dataset — not a verified address.",
}));

export function getDemoLocation(id: string): DemoLocationPreset | undefined {
  return DEMO_LOCATION_PRESETS.find((preset) => preset.id === id);
}
