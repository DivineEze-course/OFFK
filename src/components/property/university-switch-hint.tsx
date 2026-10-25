"use client";

import { GraduationCap, RefreshCw } from "lucide-react";
import { useUniversity } from "@/components/university/university-provider";

/**
 * Points out that the pricing on this page follows the globally selected
 * university — the one control that changes what every number means.
 */
export function UniversitySwitchHint() {
  const { university } = useUniversity();

  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3.5">
      <GraduationCap className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-muted">
        Prices below are quoted for{" "}
        <strong className="font-semibold text-ink">{university.shortName}</strong>. Change the
        university in the header and every rate, distance and period on this page re-quotes for the
        other school&apos;s calendar.
        <span className="mt-1 flex items-center gap-1.5 text-faint">
          <RefreshCw className="size-3" aria-hidden="true" />
          Demo behaviour — driven by the university picker.
        </span>
      </p>
    </div>
  );
}
