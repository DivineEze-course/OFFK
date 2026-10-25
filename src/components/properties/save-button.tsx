"use client";

import { Heart } from "lucide-react";
import { useFavourites } from "@/components/favourites/favourites-provider";
import { cn } from "@/lib/cn";

/**
 * Save/unsave toggle. Favourites live in localStorage for this demo — no
 * account or backend is involved.
 */
export function SaveButton({
  propertyId,
  propertyTitle,
  size = "md",
  className,
}: {
  propertyId: string;
  propertyTitle: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { isFavourite, toggleFavourite, ready } = useFavourites();
  const saved = ready && isFavourite(propertyId);

  return (
    <button
      type="button"
      onClick={(event) => {
        // Keep the card's stretched link from navigating when the heart is hit.
        event.preventDefault();
        event.stopPropagation();
        toggleFavourite(propertyId);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${propertyTitle} from saved` : `Save ${propertyTitle}`}
      title={saved ? "Remove from saved" : "Save property"}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-line bg-surface text-ink shadow-sm transition-all duration-150 hover:border-line-strong active:scale-95",
        size === "md" ? "size-9" : "size-8",
        saved && "border-accent bg-accent text-on-accent hover:border-accent-strong hover:bg-accent-strong",
        className,
      )}
    >
      <Heart className={cn(size === "md" ? "size-[18px]" : "size-4", saved && "fill-current")} aria-hidden="true" />
    </button>
  );
}
