"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { AlertTriangle, LocateFixed } from "lucide-react";
import type { Map as LeafletMap, TileLayer } from "leaflet";
import type { Property } from "@/types/property";
import type { University } from "@/types/university";
import { formatStraightLineDistance, haversineKm } from "@/lib/distance";
import { cn } from "@/lib/cn";

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Number of failed tiles before we declare remote tiles unavailable. */
const TILE_ERROR_THRESHOLD = 4;

interface MapPins {
  campus: { lat: number; lng: number };
  property: { lat: number; lng: number };
}

/**
 * Schematic demo map.
 *
 * Two illustrative pins (campus area + listing) joined by a dashed
 * straight-line. Remote raster tiles are a progressive enhancement: when they
 * can't be loaded (offline sandboxes, blocked CDNs) the map degrades to a
 * clearly-labelled schematic surface instead of an empty grey box.
 *
 * No routing or geocoding service is used — the line and the label both come
 * from the same Haversine computation as the rest of the app.
 */
export function DemoMap({
  property,
  university,
  className,
}: {
  property: Property;
  university: University;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tilesRef = useRef<TileLayer | null>(null);
  const [tilesFailed, setTilesFailed] = useState(false);

  const pins: MapPins = { campus: university.coords, property: property.coords };
  const straightKm = haversineKm(pins.campus, pins.property);
  const distanceLabel = `${formatStraightLineDistance(straightKm)} straight-line`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    let disposed = false;
    let errorCount = 0;
    const cleanups: Array<() => void> = [];

    (async () => {
      const L = await import("leaflet");
      if (disposed) return;

      const mid = {
        lat: (pins.campus.lat + pins.property.lat) / 2,
        lng: (pins.campus.lng + pins.property.lng) / 2,
      };

      const map = L.map(container, {
        center: [mid.lat, mid.lng],
        zoom: 13,
        scrollWheelZoom: false,
        attributionControl: true,
        // The pins are close together; deep zooming adds nothing to a demo.
        minZoom: 11,
        maxZoom: 17,
      });
      mapRef.current = map;

      const isDark = () => document.documentElement.classList.contains("dark");
      const tileUrl = () =>
        `https://{s}.basemaps.cartocdn.com/${isDark() ? "dark_all" : "light_all"}/{z}/{x}/{y}{r}.png`;

      const tiles = L.tileLayer(tileUrl(), {
        subdomains: "abcd",
        maxZoom: 19,
        attribution: CARTO_ATTRIBUTION,
      });
      tilesRef.current = tiles;

      tiles.on("tileerror", () => {
        errorCount += 1;
        if (errorCount >= TILE_ERROR_THRESHOLD && !disposed) {
          // Remote tiles unreachable — drop to the schematic surface.
          if (map.hasLayer(tiles)) map.removeLayer(tiles);
          setTilesFailed(true);
        }
      });
      tiles.addTo(map);

      // Keep tile style in step with the light/dark toggle.
      const themeObserver = new MutationObserver(() => {
        if (!map.hasLayer(tiles)) return;
        tiles.setUrl(tileUrl());
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      cleanups.push(() => themeObserver.disconnect());

      // Illustrative pins — clearly not real addresses.
      L.marker([pins.campus.lat, pins.campus.lng], {
        icon: L.divIcon({
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          html: '<span class="offk-pin offk-pin-campus" aria-hidden="true"></span>',
        }),
        title: `${university.shortName} campus-area pin (approximate demo pin)`,
        keyboard: false,
      })
        .addTo(map)
        .bindPopup(
          `<strong>${university.shortName}</strong><br/>Approximate campus-area pin (demo)`,
        );

      L.marker([pins.property.lat, pins.property.lng], {
        icon: L.divIcon({
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          html: '<span class="offk-pin offk-pin-property" aria-hidden="true"></span>',
        }),
        title: `${property.title} (illustrative demo pin)`,
        keyboard: false,
      })
        .addTo(map)
        .bindPopup(`<strong>${property.title}</strong><br/>Illustrative demo pin — not an address`);

      L.polyline(
        [
          [pins.campus.lat, pins.campus.lng],
          [pins.property.lat, pins.property.lng],
        ],
        { color: "#142c24", weight: 2, className: "route-line", dashArray: "10 8" },
      ).addTo(map);

      // Fit to both pins with breathing room.
      map.fitBounds(
        L.latLngBounds(
          [pins.campus.lat, pins.campus.lng],
          [pins.property.lat, pins.property.lng],
        ),
        { padding: [46, 46], maxZoom: 15 },
      );

      // Leaflet keeps its own size when the tab regains visibility.
      const onVisible = () => map.invalidateSize();
      document.addEventListener("visibilitychange", onVisible);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVisible));
    })();

    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
      mapRef.current?.remove();
      mapRef.current = null;
      tilesRef.current = null;
    };
    // Pins are stable for the lifetime of this listing page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-line bg-map-bg", className)}>
      <div
        ref={containerRef}
        role="img"
        aria-label={`Schematic demo map: ${property.title} and the ${university.shortName} campus-area pin, ${distanceLabel} apart, illustrative`}
        className="relative h-72 w-full sm:h-80"
      />

      {tilesFailed ? (
        <div className="flex items-start gap-2 border-t border-line bg-warning-soft px-4 py-3 text-xs text-warning">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <p>
            Map tiles couldn&apos;t be loaded in this environment, so the pins are shown on a plain
            schematic surface. Positions and the straight-line measurement are unchanged.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line bg-surface px-4 py-3 text-xs text-muted">
        <p className="flex items-center gap-1.5">
          <LocateFixed className="size-3.5 shrink-0 text-faint" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-ink">{distanceLabel}</strong> between two demo pins
          </span>
        </p>
        <p className="text-faint">
          Illustrative pins, not addresses · scroll to zoom, drag to pan
        </p>
      </div>
    </div>
  );
}
