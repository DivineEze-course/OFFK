"use client";

import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/types/property";
import { ACCOMMODATION_TYPE_MAP, FURNISHING_MAP } from "@/data/meta";
import { useUniversity } from "@/components/university/university-provider";
import { PropertyPrice } from "./property-price";
import { PropertyDistance } from "./property-distance";
import { SaveButton } from "./save-button";
import { AvailabilityBadge, VerificationBadge } from "./status-badges";

/**
 * Demo listing card. Price and distance react to the globally selected
 * university + rental period, so the same card re-quotes for Nile (semester)
 * and Baze (trimester) shoppers.
 */
export function PropertyCard({ property }: { property: Property }) {
  const { university } = useUniversity();
  const cover = property.images[0];
  const type = ACCOMMODATION_TYPE_MAP[property.type];

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-surface-2">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : null}

        <div className="absolute left-3 top-3 flex max-w-[calc(100%-4.5rem)] flex-wrap gap-1.5">
          <AvailabilityBadge status={property.availability.status} label={property.availability.label} />
        </div>

        <div className="absolute right-3 top-3 z-10">
          <SaveButton propertyId={property.id} propertyTitle={property.title} />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-snug font-semibold tracking-tight text-ink">
              <Link
                href={`/properties/${property.id}`}
                className="after:absolute after:inset-0 after:content-[''] hover:underline"
              >
                {property.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-muted">
              {property.area} · {type?.label}
              <span className="text-faint"> · {FURNISHING_MAP[property.furnishing]?.label}</span>
            </p>
          </div>
        </div>

        <PropertyDistance property={property} university={university} className="mt-2" />

        <div className="mt-auto pt-3">
          <PropertyPrice property={property} />
          <div className="mt-3">
            <VerificationBadge property={property} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function PropertyGrid({
  properties,
  className,
}: {
  properties: Property[];
  className?: string;
}) {
  return (
    <div
      className={
        className ?? "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3"
      }
    >
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
