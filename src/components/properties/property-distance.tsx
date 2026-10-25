"use client";

import { Ruler } from "lucide-react";
import type { Property } from "@/types/property";
import type { University } from "@/types/university";
import { formatStraightLineDistance, illustrativeStraightLineKm } from "@/lib/distance";
import { cn } from "@/lib/cn";

/**
 * Straight-line ("as the crow flies") distance between the selected campus
 * pin and the demo listing pin. Always labelled as illustrative and never as
 * travel distance — no routing service is involved.
 */
export function PropertyDistance({
  property,
  university,
  className,
  showLabel = true,
}: {
  property: Property;
  university: University;
  className?: string;
  showLabel?: boolean;
}) {
  const km = illustrativeStraightLineKm(university.coords, property.coords);

  return (
    <p
      title="Illustrative straight-line distance between demo pins — not a measured or travelled distance"
      className={cn("flex items-center gap-1.5 text-sm text-muted", className)}
    >
      <Ruler className="size-3.5 shrink-0 text-faint" aria-hidden="true" />
      <span>
        {formatStraightLineDistance(km)} straight-line
        {showLabel ? <span className="text-faint"> · illustrative</span> : null}
      </span>
    </p>
  );
}
