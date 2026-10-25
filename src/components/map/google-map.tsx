"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, LoaderCircle, MapPin, Route, TriangleAlert } from "lucide-react";
import type { Property } from "@/types/property";
import type { University } from "@/types/university";
import { haversineKm, formatStraightLineDistance } from "@/lib/distance";
import {
  GOOGLE_MAPS_CONFIGURED,
  GOOGLE_SETUP_NOTE,
  decodePolyline,
  fetchRoadRoute,
  googleDirectionsUrl,
  loadGoogleMaps,
} from "@/lib/google-maps";
import { routeKey, saveRoute } from "@/lib/marketplace-store";
import { DemoMap } from "@/components/map/demo-map";
import { DemoNotice } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { SelectInput } from "@/components/ui/field";
import { cn } from "@/lib/cn";

const TRAVEL_MODES = [
  { id: "DRIVE" as const, label: "Driving" },
  { id: "WALK" as const, label: "Walking" },
  { id: "BICYCLE" as const, label: "Cycling" },
  { id: "TRANSIT" as const, label: "Transit" },
];

/**
 * Google map when configured; honest schematic fallback when not.
 *
 * Road distance/time only ever comes from a successful Routes API response.
 * The straight-line figure is calculated separately and never multiplied into
 * a fake travel estimate.
 */
export function PropertyMap({
  property,
  university,
  compact = false,
}: {
  property: Property;
  university: University;
  compact?: boolean;
}) {
  if (!GOOGLE_MAPS_CONFIGURED) {
    return (
      <div className="space-y-3">
        <DemoMap property={property} university={university} />
        <DemoNotice title="Google Maps is not configured">
          {GOOGLE_SETUP_NOTE} Distances below remain clearly labelled straight-line demo
          estimates.
        </DemoNotice>
      </div>
    );
  }

  return <GooglePropertyMap property={property} university={university} compact={compact} />;
}

function GooglePropertyMap({
  property,
  university,
  compact,
}: {
  property: Property;
  university: University;
  compact: boolean;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const routeRef = useRef<google.maps.Polyline | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [travelMode, setTravelMode] = useState<(typeof TRAVEL_MODES)[number]["id"]>("DRIVE");
  const [routeStatus, setRouteStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [routeError, setRouteError] = useState("");
  const [route, setRoute] = useState<{ distanceKm: number; durationMinutes: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((googleApi) => {
        if (cancelled || !mapRef.current) return;
        const center = {
          lat: (property.coords.lat + university.coords.lat) / 2,
          lng: (property.coords.lng + university.coords.lng) / 2,
        };
        const map = new googleApi.maps.Map(mapRef.current, {
          center,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: !compact,
        });
        mapInstanceRef.current = map;

        new googleApi.maps.Marker({
          map,
          position: university.coords,
          title: `${university.shortName} (demo campus pin)`,
          label: { text: "U", color: "#142c24", fontWeight: "700" },
        });
        new googleApi.maps.Marker({
          map,
          position: property.coords,
          title: `${property.title} (demo or selected listing pin)`,
          label: { text: "P", color: "#142c24", fontWeight: "700" },
        });

        const bounds = new googleApi.maps.LatLngBounds();
        bounds.extend(university.coords);
        bounds.extend(property.coords);
        map.fitBounds(bounds, 48);

        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Google Maps failed to load.");
      });

    return () => {
      cancelled = true;
    };
  }, [compact, property.coords, property.title, university.coords, university.shortName]);

  async function loadRoute() {
    setRouteStatus("loading");
    setRouteError("");
    try {
      const result = await fetchRoadRoute({
        origin: university.coords,
        destination: property.coords,
        travelMode,
      });
      setRoute({ distanceKm: result.distanceKm, durationMinutes: result.durationMinutes });
      setRouteStatus("ready");
      saveRoute({
        key: routeKey(property.id, university.id, travelMode),
        propertyId: property.id,
        universityId: university.id,
        travelMode,
        distanceKm: result.distanceKm,
        durationMinutes: result.durationMinutes,
        fetchedAt: new Date().toISOString(),
        isLive: true,
        provider: "google-routes",
      });

      if (result.encodedPolyline && mapInstanceRef.current) {
        const coords = decodePolyline(result.encodedPolyline);
        routeRef.current?.setMap(null);
        if (coords.length > 0) {
          routeRef.current = new google.maps.Polyline({
            path: coords,
            strokeColor: "#142c24",
            strokeOpacity: 0.85,
            strokeWeight: 4,
          });
          routeRef.current.setMap(mapInstanceRef.current);
        }
      }
    } catch (error) {
      setRouteStatus("error");
      setRouteError(
        error instanceof Error ? error.message : "Routes API request failed without a message.",
      );
    }
  }

  const straightKm = haversineKm(university.coords, property.coords);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-line bg-map-bg",
          compact ? "h-64" : "h-80",
        )}
      >
        <div ref={mapRef} className="size-full" aria-label={`Google map for ${property.title}`} />
        {status === "loading" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 text-sm text-muted">
            <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Loading Google Maps…
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface p-6 text-center text-sm text-danger">
            <TriangleAlert className="size-5" aria-hidden="true" />
            <span>{message}</span>
            <span className="text-xs text-faint">
              No map is drawn and no route is implied. Check the API key restrictions.
            </span>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
              Road route (Google Routes)
            </p>
            <p className="mt-1 text-xs text-faint">
              Asking Google for a real route may incur API usage. It is only requested when you
              press the button.
            </p>
          </div>
          <div className="flex items-end gap-2">
            <label className="text-xs text-faint">
              <span className="sr-only">Travel mode</span>
              <SelectInput
                value={travelMode}
                onChange={(event) => {
                  setTravelMode(event.target.value as (typeof TRAVEL_MODES)[number]["id"]);
                  setRoute(null);
                  setRouteStatus("idle");
                  setRouteError("");
                  routeRef.current?.setMap(null);
                  routeRef.current = null;
                }}
                className="h-9 min-w-32 text-xs"
              >
                {TRAVEL_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label}
                  </option>
                ))}
              </SelectInput>
            </label>
            <button
              type="button"
              onClick={loadRoute}
              disabled={routeStatus === "loading" || status !== "ready"}
              className={buttonClasses("outline", "sm")}
            >
              {routeStatus === "loading" ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Route className="size-4" aria-hidden="true" />
              )}
              Get road route
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-faint">Straight-line (calculated locally)</p>
            <p className="font-display mt-1 text-lg font-semibold text-ink">
              {formatStraightLineDistance(straightKm)}
            </p>
            <p className="mt-1 text-xs text-faint">
              Illustrative only — not a road, walking or transit distance.
            </p>
          </div>
          <div>
            <p className="text-xs text-faint">Road route (live Google response)</p>
            {routeStatus === "ready" && route ? (
              <>
                <p className="font-display mt-1 text-lg font-semibold text-ink">
                  {route.distanceKm.toFixed(1)} km · {Math.round(route.durationMinutes)} min
                </p>
                <p className="mt-1 text-xs text-faint">
                  Google Routes · {TRAVEL_MODES.find((mode) => mode.id === travelMode)?.label} ·
                  fetched now
                </p>
              </>
            ) : routeStatus === "error" ? (
              <p className="mt-1 text-xs text-danger">{routeError} No distance or time is shown.</p>
            ) : routeStatus === "loading" ? (
              <p className="mt-1 text-xs text-muted">Requesting route…</p>
            ) : (
              <p className="mt-1 text-xs text-faint">
                No route fetched. Press “Get road route” to request one.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={googleDirectionsUrl({
              origin: university.coords,
              destination: property.coords,
              travelMode: travelMode.toLowerCase() as "driving" | "walking" | "bicycling" | "transit",
            })}
            target="_blank"
            rel="noreferrer"
            className={buttonClasses("ghost", "sm")}
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Open directions in Google Maps
          </a>
          <span className="inline-flex items-center gap-1.5 text-xs text-faint">
            <MapPin className="size-3.5" aria-hidden="true" />
            {property.location.verification === "google-verified"
              ? "Listing pin from a Google Place selection"
              : "Listing pin is a demo / unverified location"}
          </span>
        </div>
        <p className="mt-3 text-xs text-faint">
          The route is never estimated by multiplying the straight-line distance. If Google
          Routes fails, no road distance or travel time is shown.
        </p>
      </div>
    </div>
  );
}
