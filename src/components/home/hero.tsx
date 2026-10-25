import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Ruler, Sparkles } from "lucide-react";
import { HeroSearch } from "@/components/search/hero-search";
import { DemoBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

const PROOF_POINTS = [
  { icon: Ruler, label: "Straight-line distances, honestly labelled" },
  { icon: CalendarDays, label: "Priced in your school's calendar" },
  { icon: Sparkles, label: "Every listing marked as demo data" },
];

/**
 * Homepage hero. Editorial split: headline + search launcher on the left,
 * a stack of brand illustrations on the right (all local SVG demo art).
 */
export function Hero() {
  return (
    <section className="border-b border-line bg-canvas">
      <div className="page-container grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
              Off-campus living, sorted
            </span>
            <DemoBadge label="Sample listings" />
          </div>

          <h1 className="font-display mt-6 text-4xl leading-[1.05] font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Find your space.
            <br />
            Own your{" "}
            <span className="relative inline-block">
              student
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 -z-10 h-3 bg-accent sm:h-4"
              />
            </span>{" "}
            experience.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            OFFK brings off-campus accommodation near Nigerian universities into one place, with rent
            quoted in the calendar your school actually uses — and distances you can see at a glance.
          </p>

          <HeroSearch className="mt-8 max-w-xl" />

          <ul className="mt-8 grid gap-2.5 border-t border-line pt-6 sm:grid-cols-1">
            {PROOF_POINTS.map((point) => (
              <li key={point.label} className="flex items-center gap-2.5 text-sm text-muted">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-surface-2 text-muted">
                  <point.icon className="size-4" aria-hidden="true" />
                </span>
                {point.label}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/properties" className={buttonClasses("primary", "md")}>
              Browse all sample listings
            </Link>
            <Link href="/universities" className={buttonClasses("outline", "md")}>
              How pricing works
            </Link>
          </div>
        </div>

        {/* Illustration composition — local demo artwork, no remote images. */}
        <div className="relative">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-line bg-surface-2">
            <Image
              src="/images/hero/hero-main.svg"
              alt="Illustration of a shared student living room with sofa and study desk (demo artwork)"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 94vw"
              className="object-cover"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-line bg-surface-2">
              <Image
                src="/images/hero/hero-secondary.svg"
                alt="Illustration of a furnished student bedroom with a desk by the window (demo artwork)"
                fill
                sizes="(min-width: 1024px) 23vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-line bg-surface-2">
              <Image
                src="/images/hero/hero-tertiary.svg"
                alt="Illustration of an apartment block exterior with trees and a gate (demo artwork)"
                fill
                sizes="(min-width: 1024px) 23vw, 46vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Floating explainer chips — solid surfaces, hidden where they'd crowd. */}
          <div className="absolute -top-4 -left-4 hidden rounded-xl border border-line bg-surface px-4 py-3 shadow-sm lg:block">
            <p className="text-xs font-semibold tracking-[0.14em] text-faint uppercase">Nile model</p>
            <p className="font-display mt-0.5 text-sm font-semibold text-ink">
              1 session = 2 semesters
            </p>
          </div>
          <div className="absolute -right-4 -bottom-5 hidden rounded-xl border border-line bg-surface px-4 py-3 shadow-sm lg:block">
            <p className="text-xs font-semibold tracking-[0.14em] text-faint uppercase">Baze model</p>
            <p className="font-display mt-0.5 text-sm font-semibold text-ink">
              1 session = 3 trimesters
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
