"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, MapPin, Search, TriangleAlert } from "lucide-react";
import type { DraftLocation } from "@/types/marketplace";
import { DEMO_LOCATION_PRESETS, getDemoLocation } from "@/data/demo-locations";
import {
  GOOGLE_MAPS_CONFIGURED,
  GOOGLE_SETUP_NOTE,
  loadGoogleMaps,
} from "@/lib/google-maps";
import { DemoNotice } from "@/components/ui/badge";
import { SelectInput } from "@/components/ui/field";
import { cn } from "@/lib/cn";

/**
 * Google Places address picker for the landlord wizard.
 *
 * A typed string is never treated as a verified address: only a
 * `place_changed` event with a Place ID and coordinates can set
 * `mode: "google"`. When Google is not configured the landlord must choose one
 * of the explicitly labelled demo pins, which is stored as unverified.
 */
export function PlacePicker({
  value,
  onChange,
  inputId = "listing-address",
}: {
  value: DraftLocation;
  onChange: (location: DraftLocation) => void;
  inputId?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  const selectingRef = useRef(false);
  const [query, setQuery] = useState(value.formattedAddress ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [demoId, setDemoId] = useState("");
  const [syncedAddress, setSyncedAddress] = useState(value.formattedAddress);

  // Keep the text box in step with the address chosen elsewhere (e.g. a draft
  // restored from storage). Adjusting state during render avoids the extra
  // render pass that setting it from an effect would cause.
  if (value.formattedAddress !== syncedAddress) {
    setSyncedAddress(value.formattedAddress);
    if (value.formattedAddress) setQuery(value.formattedAddress);
  }

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!GOOGLE_MAPS_CONFIGURED || !inputRef.current) return;
    let cancelled = false;
    let autocomplete: google.maps.places.Autocomplete | null = null;
    setStatus("loading");

    loadGoogleMaps()
      .then((googleApi) => {
        if (cancelled || !inputRef.current) return;
        autocomplete = new googleApi.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "ng" },
          fields: ["formatted_address", "place_id", "geometry", "name"],
          types: ["address"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
          const lat = place?.geometry?.location?.lat();
          const lng = place?.geometry?.location?.lng();
          if (!place?.place_id || lat == null || lng == null) {
            onChangeRef.current({
              mode: "none",
              note: "The selected Google suggestion had no usable coordinates. Choose another suggestion or a demo pin.",
            });
            return;
          }
          selectingRef.current = true;
          const formattedAddress =
            place.formatted_address ?? place.name ?? "Google Place selected";
          setQuery(formattedAddress);
          onChangeRef.current({
            mode: "google",
            formattedAddress,
            placeId: place.place_id,
            coords: { lat, lng },
            note: "Selected from Google Places. Identity and ownership verification are still pending.",
          });
          window.setTimeout(() => {
            selectingRef.current = false;
          }, 0);
        });
        setStatus("ready");
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setError(
          loadError instanceof Error ? loadError.message : "Google Places failed to load.",
        );
      });

    return () => {
      cancelled = true;
      if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, []);

  // Draw the selected Google pin once the API is available.
  useEffect(() => {
    if (!GOOGLE_MAPS_CONFIGURED || value.mode !== "google" || !value.coords || !previewRef.current) {
      return;
    }
    let cancelled = false;
    loadGoogleMaps()
      .then((googleApi) => {
        if (cancelled || !previewRef.current || !value.coords) return;
        const map = new googleApi.maps.Map(previewRef.current, {
          center: value.coords,
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        new googleApi.maps.Marker({
          map,
          position: value.coords,
          title: "Selected Google Place",
        });
      })
      .catch(() => {
        // The text warning above is sufficient; no fake pin is drawn.
      });
    return () => {
      cancelled = true;
    };
  }, [value.mode, value.coords]);

  if (!GOOGLE_MAPS_CONFIGURED) {
    return (
      <div className="space-y-3">
        <DemoNotice title="Google Places is not configured">
          {GOOGLE_SETUP_NOTE} You can still choose a clearly labelled demo pin below for this
          browser-only listing. It will never be presented as a verified address.
        </DemoNotice>
        <label htmlFor={`${inputId}-demo`} className="block text-sm font-medium text-ink">
          Demo location (required)
        </label>
        <SelectInput
          id={`${inputId}-demo`}
          value={demoId}
          onChange={(event) => {
            const nextId = event.target.value;
            setDemoId(nextId);
            const preset = getDemoLocation(nextId);
            if (!preset) {
              onChange({
                mode: "none",
                note: "No demo location selected.",
              });
              return;
            }
            onChange({
              mode: "demo",
              formattedAddress: preset.label,
              coords: preset.coords,
              note: preset.note,
            });
          }}
        >
          <option value="">Select a demo location…</option>
          {DEMO_LOCATION_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </SelectInput>
        {value.mode === "demo" && value.coords ? (
          <div className="rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs text-warning">
            <p className="flex items-center gap-1.5 font-medium">
              <TriangleAlert className="size-3.5" aria-hidden="true" />
              Demo location — not verified
            </p>
            <p className="mt-1">
              {value.formattedAddress} · {value.coords.lat.toFixed(4)},{" "}
              {value.coords.lng.toFixed(4)}. This neighbourhood pin is illustrative only. Enable
              Google Places before treating this as a real address.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        Property address (Nigeria only)
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={query}
          placeholder="Start typing a street address…"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            if (selectingRef.current) return;
            if (value.mode !== "none") {
              onChange({
                mode: "none",
                note: "Address text changed after selection. Choose a Google suggestion to verify it again.",
              });
            }
          }}
          className="h-11 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
        />
        {status === "loading" ? (
          <LoaderCircle
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="min-h-6 text-xs">
        {status === "error" ? (
          <p className="flex items-center gap-1.5 text-danger">
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            {error} No address is verified.
          </p>
        ) : value.mode === "google" && value.placeId ? (
          <p className="flex items-center gap-1.5 text-success">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Google Place selected: {value.formattedAddress}
          </p>
        ) : query.trim() ? (
          <p className="flex items-center gap-1.5 text-warning">
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            Select an address from the Google suggestions. Typed text alone is not verified.
          </p>
        ) : (
          <p className="text-faint">
            Autocomplete is restricted to Nigeria. A Place ID and coordinates are required.
          </p>
        )}
      </div>

      <div
        ref={previewRef}
        className={cn(
          "overflow-hidden rounded-xl border border-line bg-map-bg",
          value.mode === "google" && value.coords ? "h-52" : "hidden",
        )}
        aria-label="Preview of the selected Google Place"
      />

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs text-faint">
        <MapPin className="size-3.5" aria-hidden="true" />
        <span>
          {value.mode === "google" && value.coords
            ? `Pin: ${value.coords.lat.toFixed(5)}, ${value.coords.lng.toFixed(5)}`
            : "No verified pin yet."}
        </span>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            onChange({ mode: "none", note: "Location cleared." });
          }}
          className="ml-auto rounded-md border border-line px-2 py-1 font-medium text-muted hover:bg-surface-2"
        >
          Clear location
        </button>
      </div>
    </div>
  );
}
