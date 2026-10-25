"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import type { PropertyImage } from "@/types/property";
import { cn } from "@/lib/cn";

/**
 * Detail gallery with a keyboard-accessible lightbox. Images are local demo
 * illustrations, so the lightbox loads instantly even offline.
 */
export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const active = images[activeIndex];

  const close = useCallback(() => setLightboxOpen(false), []);
  const step = useCallback(
    (delta: number) => {
      setActiveIndex((current) => (current + delta + images.length) % images.length);
    },
    [images.length],
  );

  // Close on Escape and lock background scroll while open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, close, step]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-line bg-surface-2">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group absolute inset-0 z-10 cursor-zoom-in"
            aria-label={`Open image gallery for ${title} (image ${activeIndex + 1} of ${images.length})`}
          >
            <Image
              src={active.src}
              alt={active.alt}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 94vw"
              className="object-cover"
            />
            <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-canvas/95 px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Images className="size-3.5" aria-hidden="true" />
              View all {images.length}
            </span>
          </button>
        </div>

        {images.length > 1 ? (
          <ul className="grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <li key={image.src}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveIndex(index);
                    setLightboxOpen(true);
                  }}
                  aria-label={`Show image ${index + 1} of ${images.length} for ${title}`}
                  aria-current={index === activeIndex}
                  className={cn(
                    "relative aspect-4/3 w-full overflow-hidden rounded-lg border transition-colors",
                    index === activeIndex
                      ? "border-btn-primary-bg ring-2 ring-accent"
                      : "border-line hover:border-line-strong",
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 15vw, 22vw"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Images for ${title}`}
          className="fixed inset-0 z-50 flex flex-col bg-canvas"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4 sm:px-6">
            <p className="text-sm text-muted">
              <span className="font-medium text-ink">{title}</span>{" "}
              <span className="text-faint">
                · image {activeIndex + 1} of {images.length}
              </span>
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close image gallery"
              className="inline-flex size-10 items-center justify-center rounded-lg text-ink hover:bg-surface-2"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8">
            <Image
              src={active.src}
              alt={active.alt}
              fill
              sizes="100vw"
              className="object-contain p-4 sm:p-10"
            />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className="absolute left-3 inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-surface-2 sm:left-6"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className="absolute right-3 inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-surface-2 sm:right-6"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-line px-4 py-4 sm:px-6">
            <p className="mx-auto max-w-3xl text-center text-xs text-faint">{active.alt}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
