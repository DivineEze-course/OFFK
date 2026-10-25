import Link from "next/link";
import { Wordmark } from "@/components/ui/logo";
import { UNIVERSITIES } from "@/data/universities";

const FOOTER_LINKS = {
  explore: [
    { label: "All accommodation", href: "/properties" },
    { label: "Universities", href: "/universities" },
    { label: "Saved properties", href: "/saved" },
    { label: "Student dashboard", href: "/dashboard" },
  ],
  landlords: [
    { label: "List your property", href: "/landlord" },
    { label: "Landlord dashboard", href: "/landlord" },
    { label: "Create an account", href: "/sign-in" },
  ],
} as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="page-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark />
          <p className="font-display mt-4 text-lg font-medium tracking-tight text-ink">
            Find your space. Own your student experience.
          </p>
          <p className="mt-3 text-sm text-muted">
            Off-campus accommodation discovery for Nigerian university students, with pricing that
            speaks your school&apos;s language.
          </p>
        </div>

        <nav aria-label="Explore">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Explore</p>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_LINKS.explore.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-ink transition-colors hover:text-muted">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="For landlords">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">For landlords</p>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_LINKS.landlords.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-ink transition-colors hover:text-muted">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 space-y-2.5">
            {UNIVERSITIES.map((university) => (
              <li key={university.id} className="text-sm text-muted">
                {university.shortName} ({university.city})
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="page-container flex flex-col gap-2 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 OFFK — frontend demo template. Not a live accommodation service.</p>
          <p>
            All listings, landlords, prices, availability and distances shown here are fictional
            sample data.
          </p>
        </div>
      </div>
    </footer>
  );
}
