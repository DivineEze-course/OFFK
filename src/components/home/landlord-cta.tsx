import Link from "next/link";
import { ArrowRight, Building } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/** Landlord conversion band closing the homepage. */
export function LandlordCta() {
  return (
    <section className="page-container pb-20">
      <div className="relative overflow-hidden rounded-2xl bg-brand px-6 py-12 text-on-brand sm:px-10 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-accent/20 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-[0.14em] text-on-accent uppercase">
              For landlords & agents
            </span>
            <h2 className="font-display mt-5 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              List your property once. Quote it in every calendar.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed opacity-90">
              Set a semester price or a trimester price and OFFK derives the rest for each
              university&apos;s demo model — including explicit session terms when your real rental
              deal differs from the formula.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/landlord"
              className={buttonClasses(
                "primary",
                "lg",
                "bg-canvas text-ink hover:bg-canvas/90 hover:text-ink",
              )}
            >
              <Building className="size-4" aria-hidden="true" />
              Open landlord dashboard
            </Link>
            <Link
              href="/universities"
              className={buttonClasses("outline", "lg", "border-on-brand/40 bg-transparent text-on-brand hover:bg-on-brand/10 hover:text-on-brand")}
            >
              See the pricing rules
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <p className="relative mt-8 border-t border-on-brand/25 pt-5 text-xs opacity-80">
          Demo template — the landlord dashboard shows sample listings, views and enquiries only.
          Nothing here is published, sent or measured.
        </p>
      </div>
    </section>
  );
}
