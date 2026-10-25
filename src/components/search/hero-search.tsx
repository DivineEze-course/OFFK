"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { ACCOMMODATION_TYPES } from "@/data/meta";
import { useUniversity } from "@/components/university/university-provider";
import { UniversityPicker } from "@/components/university/university-picker";
import { PeriodToggle } from "@/components/search/period-toggle";
import { SelectInput } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { formatNaira } from "@/lib/format-currency";
import type { AccommodationTypeId } from "@/types/property";
import { cn } from "@/lib/cn";

const BUDGET_MAX_OPTIONS = [300_000, 500_000, 800_000, 1_200_000, 2_000_000] as const;

/**
 * Homepage search launcher. Builds a /properties URL carrying the university,
 * rental period and quick filters; the search page takes over from there.
 */
export function HeroSearch({ className }: { className?: string }) {
  const router = useRouter();
  const { university, period } = useUniversity();
  const [type, setType] = useState<AccommodationTypeId | "all">("all");
  const [maxBudget, setMaxBudget] = useState<number | "">("");

  const periodLabel = university.rentalPeriods.find((option) => option.id === period)?.shortLabel.toLowerCase() ?? "period";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ university: university.id, period });
    if (type !== "all") params.set("type", type);
    if (maxBudget !== "") params.set("max", String(maxBudget));
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className={cn("space-y-5", className)}>
      <div className="space-y-2.5">
        <label className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
          I study at
        </label>
        <UniversityPicker />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="hero-type" className="block text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            Accommodation type
          </label>
          <SelectInput
            id="hero-type"
            value={type}
            onChange={(event) => setType(event.target.value as AccommodationTypeId | "all")}
          >
            <option value="all">Any type</option>
            {ACCOMMODATION_TYPES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="hero-budget" className="block text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            Budget ({periodLabel})
          </label>
          <SelectInput
            id="hero-budget"
            value={maxBudget}
            onChange={(event) => setMaxBudget(event.target.value === "" ? "" : Number(event.target.value))}
          >
            <option value="">Any budget</option>
            {BUDGET_MAX_OPTIONS.map((amount) => (
              <option key={amount} value={amount}>
                Up to {formatNaira(amount)}
              </option>
            ))}
          </SelectInput>
        </div>
      </div>

      <PeriodToggle />

      <button type="submit" className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
        <Search className="size-4" aria-hidden="true" />
        Search accommodation
      </button>

      <p className="text-xs text-faint">
        Showing sample listings — every property, price and distance in this demo is fictional.
      </p>
    </form>
  );
}
