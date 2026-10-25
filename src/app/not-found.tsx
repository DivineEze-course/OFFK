import Link from "next/link";
import { Compass, Heart, SearchX } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-container flex flex-col items-center justify-center py-24 text-center">
      <span className="font-display inline-flex size-14 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-on-accent">
        404
      </span>
      <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        This address doesn&apos;t exist
      </h1>
      <p className="mt-3 max-w-md text-base text-muted">
        The listing you&apos;re after may have been a demo entry that has since been renamed, or the
        link is out of date.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/properties" className={buttonClasses("primary", "md")}>
          <SearchX className="size-4" aria-hidden="true" />
          Back to search
        </Link>
        <Link href="/" className={buttonClasses("outline", "md")}>
          <Compass className="size-4" aria-hidden="true" />
          Go home
        </Link>
        <Link href="/saved" className={buttonClasses("ghost", "md")}>
          <Heart className="size-4" aria-hidden="true" />
          Your shortlist
        </Link>
      </div>

      <p className="mt-10 max-w-lg text-xs text-faint">
        OFFK is a frontend demo template — all listings, prices and availability shown in this app
        are fictional sample data.
      </p>
    </div>
  );
}
