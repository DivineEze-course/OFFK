"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Image wrapper that never lets a failed/absent photo break a card layout.
 * Give it a new `key` when the source changes so the error state resets.
 */
export function SafeImage({
  src,
  alt,
  sizes,
  className,
  fallbackLabel = "No photo available",
  priority = false,
  fill = true,
}: {
  src?: string;
  alt: string;
  sizes?: string;
  className?: string;
  fallbackLabel?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error",
  );

  if (!src || status === "error") {
    return (
      <div
        className={cn(
          "flex size-full flex-col items-center justify-center gap-1 bg-surface-2 p-4 text-center text-xs text-faint",
          className,
        )}
        role="img"
        aria-label={fallbackLabel}
      >
        <ImageOff className="size-5" aria-hidden="true" />
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <>
      {status === "loading" ? (
        <span className="absolute inset-0 grid place-items-center bg-surface-2 text-faint">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading image</span>
        </span>
      ) : null}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        unoptimized
        priority={priority}
        sizes={sizes}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={cn(
          "object-cover transition-opacity duration-300",
          status === "loaded" ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
