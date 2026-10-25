"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Star, Trash2, TriangleAlert } from "lucide-react";
import type { PropertyImage } from "@/types/property";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 2 * 1024 * 1024;

/**
 * Browser-only image uploader.
 *
 * Files are read to data URLs and saved in localStorage by the demo store — they
 * are never uploaded to a server. Type, size and count are checked before the
 * photos enter the draft.
 */
export function ImageUploader({
  photos,
  onChange,
  max = 8,
  label = "Add photos",
  hint = "JPEG, PNG or WebP · max 2 MB per image. Stored in this browser only.",
}: {
  photos: PropertyImage[];
  onChange: (photos: PropertyImage[]) => void;
  max?: number;
  label?: string;
  hint?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [reading, setReading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const nextErrors: string[] = [];
    const accepted: File[] = [];

    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        nextErrors.push(`${file.name}: unsupported file type. Use JPEG, PNG or WebP.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        nextErrors.push(`${file.name}: ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the 2 MB limit.`);
        continue;
      }
      accepted.push(file);
    }

    const room = max - photos.length;
    if (accepted.length > room) {
      nextErrors.push(
        room <= 0
          ? `You already have the maximum of ${max} photos.`
          : `Only ${room} more photo${room === 1 ? "" : "s"} can be added (max ${max}).`,
      );
      accepted.splice(Math.max(0, room));
    }

    setErrors(nextErrors);
    if (accepted.length === 0) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setReading(true);
    try {
      const newPhotos = await Promise.all(
        accepted.map(
          (file) =>
            new Promise<PropertyImage>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result !== "string") {
                  reject(new Error(`${file.name}: could not be read.`));
                  return;
                }
                resolve({
                  src: reader.result,
                  alt: `Landlord-uploaded demo photo: ${file.name}. Uploaded in this browser only.`,
                  kind: "upload",
                  isDemo: true,
                  credit: "Landlord upload (local demo)",
                });
              };
              reader.onerror = () => reject(new Error(`${file.name}: could not be read.`));
              reader.readAsDataURL(file);
            }),
        ),
      );
      onChange([...photos, ...newPhotos]);
    } catch (error) {
      setErrors((current) => [
        ...current,
        error instanceof Error ? error.message : "Some photos could not be read.",
      ]);
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(index: number) {
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...photos];
    const [cover] = next.splice(index, 1);
    onChange([cover, ...next]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="text-xs text-faint">{hint}</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={reading || photos.length >= max}
          className={buttonClasses("outline", "sm")}
        >
          {reading ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-4" aria-hidden="true" />
          )}
          {reading ? "Reading files…" : `Choose images (${photos.length}/${max})`}
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="sr-only"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      {errors.length > 0 ? (
        <ul className="space-y-1 rounded-lg border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
          {errors.map((error) => (
            <li key={error} className="flex gap-1.5">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {error}
            </li>
          ))}
        </ul>
      ) : null}

      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-2 p-6 text-sm text-muted hover:border-brand/40 hover:text-ink"
        >
          <ImagePlus className="size-6" aria-hidden="true" />
          <span>No photos uploaded yet</span>
          <span className="text-xs text-faint">Click to choose images from your device</span>
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={`${photo.src.slice(0, 40)}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-line bg-surface-2"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
                {index === 0 ? (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-on-accent">
                    <Star className="size-3" aria-hidden="true" />
                    Cover
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-1 border-t border-line p-1.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move photo earlier"
                  className="rounded p-1 text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === photos.length - 1}
                  aria-label="Move photo later"
                  className="rounded p-1 text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
                >
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => makeCover(index)}
                  disabled={index === 0}
                  className={cn(
                    "ml-auto rounded px-1.5 py-1 text-[11px] font-medium text-muted hover:bg-surface hover:text-ink",
                    index === 0 && "invisible",
                  )}
                >
                  Make cover
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remove photo"
                  className="rounded p-1 text-muted hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
