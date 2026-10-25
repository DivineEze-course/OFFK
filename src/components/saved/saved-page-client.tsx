"use client";

import { Heart, Trash2 } from "lucide-react";
import { PROPERTIES } from "@/data/properties";
import { useFavourites } from "@/components/favourites/favourites-provider";
import { useUniversity } from "@/components/university/university-provider";
import { PropertyGrid } from "@/components/properties/property-card";
import { EmptyState } from "@/components/ui/section-heading";
import { DemoNotice } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Shortlist page. Favourites live in localStorage for this demo — no account
 * or backend is involved, which the page states up front.
 */
export function SavedPageClient() {
  const { ids, ready, clearFavourites, count } = useFavourites();
  const { university } = useUniversity();

  const saved = PROPERTIES.filter((property) => ids.has(property.id));

  return (
    <div className="page-container py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Shortlist</p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Saved properties
          </h1>
          <p className="mt-3 text-base text-muted">
            {ready && count > 0
              ? `${count} demo ${count === 1 ? "listing" : "listings"} saved for browsing near ${university.shortName}.`
              : "Tap the heart on any listing to keep it here."}
          </p>
        </div>

        {ready && count > 0 ? (
          <Button variant="outline" size="sm" onClick={clearFavourites}>
            <Trash2 className="size-4" aria-hidden="true" />
            Clear all
          </Button>
        ) : null}
      </header>

      <div className="mt-6">
        <DemoNotice title="Saved in this browser only">
          The shortlist uses localStorage. Clearing site data — or opening this template in another
          browser — resets it. Nothing is synced to a server.
        </DemoNotice>
      </div>

      <div className="mt-8">
        {!ready ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-4/3 animate-pulse rounded-xl bg-surface-2" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
              </div>
            ))}
          </div>
        ) : saved.length > 0 ? (
          <PropertyGrid properties={saved} />
        ) : (
          <EmptyState
            icon={<Heart className="size-8" aria-hidden="true" />}
            title="No saved listings yet"
            description="Browse the demo dataset and tap the heart on anything worth a second look. Saving works without an account."
            action={{ label: "Browse sample listings", href: "/properties" }}
          />
        )}
      </div>
    </div>
  );
}
