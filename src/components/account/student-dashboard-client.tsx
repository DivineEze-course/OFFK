"use client";

import Link from "next/link";
import {
  CalendarDays,
  Heart,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { DEMO_BOOKING_REQUESTS, DEMO_STUDENT, REQUEST_STATUS_META } from "@/data/demo";
import { PROPERTIES, getProperty } from "@/data/properties";
import { getUniversity } from "@/data/universities";
import { useDemoSession } from "@/components/account/demo-session-provider";
import { useFavourites } from "@/components/favourites/favourites-provider";
import { useUniversity } from "@/components/university/university-provider";
import { PropertyGrid } from "@/components/properties/property-card";
import { DemoBadge, DemoNotice } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";

const STATUS_TONES: Record<string, string> = {
  pending: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  muted: "bg-surface-2 text-muted border border-line",
};

/**
 * Student dashboard shell. Everything on it — profile, enquiry statuses,
 * figures — comes from `data/demo.ts` and is badged accordingly.
 */
export function StudentDashboardClient() {
  const { user, ready } = useDemoSession();
  const { ids: favouriteIds, ready: favouritesReady } = useFavourites();
  const { university } = useUniversity();

  const saved = PROPERTIES.filter((property) => favouriteIds.has(property.id));
  const student = DEMO_STUDENT;

  if (ready && !user) {
    return (
      <div className="page-container py-16">
        <EmptyState
          icon={<LayoutDashboard className="size-8" aria-hidden="true" />}
          title="Sign in to see the demo dashboard"
          description="The student dashboard shows how a signed-in account would track saved listings and enquiries. Signing in takes one click and stores a local flag only."
          action={{ label: "Open demo sign-in", href: "/sign-in" }}
        />
      </div>
    );
  }

  return (
    <div className="page-container py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            Student dashboard
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Welcome back, {user?.name ?? student.name.split(" ")[0]}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted">
            A single view of your shortlist, your enquiry activity and the sample profile this
            template ships with.
          </p>
        </div>
        <DemoBadge label="Demo dashboard" />
      </header>

      <div className="mt-6">
        <DemoNotice title="Everything below is sample data">
          Enquiry statuses, move-in windows, budget notes and profile details are invented. No
          message has been sent to any landlord.
        </DemoNotice>
      </div>

      {/* ---------------------------------------------------------- stats */}
      <section aria-label="Dashboard summary" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Heart className="size-4" />} label="Saved listings" value={String(saved.length)} note="Stored in this browser" />
        <StatCard
          icon={<MessageSquare className="size-4" />}
          label="Open enquiries"
          value={String(DEMO_BOOKING_REQUESTS.filter((request) => request.status !== "declined").length)}
          note="Sample figure"
        />
        <StatCard icon={<Wallet className="size-4" />} label="Budget" value="₦300k–₦900k" note="Per semester (sample)" />
        <StatCard
          icon={<MapPin className="size-4" />}
          label="Campus"
          value={university.shortName.replace(" University", "")}
          note="Currently selected"
        />
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* -------------------------------------------------- enquiries */}
        <section aria-labelledby="enquiries">
          <div className="flex items-end justify-between gap-3">
            <h2 id="enquiries" className="font-display text-xl font-semibold text-ink">
              Enquiry activity
            </h2>
            <span className="text-xs text-faint">Demo records</span>
          </div>

          <ul className="mt-4 space-y-3">
            {DEMO_BOOKING_REQUESTS.map((request) => {
              const meta = REQUEST_STATUS_META[request.status];
              const listing = getProperty(request.propertyId);
              const requestUniversity = getUniversity(request.universityId);

              return (
                <li
                  key={request.id}
                  className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-ink">
                        {listing ? (
                          <Link
                            href={`/properties/${listing.id}`}
                            className="hover:underline"
                          >
                            {request.propertyName}
                          </Link>
                        ) : (
                          request.propertyName
                        )}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {request.area} · {requestUniversity.shortName} · per{" "}
                        {requestUniversity.rentalPeriods.find((option) => option.id === request.period)
                          ?.shortLabel.toLowerCase() ?? "period"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                        STATUS_TONES[meta.tone],
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 border-t border-line pt-3 text-xs sm:grid-cols-3">
                    <div>
                      <dt className="text-faint">Requested</dt>
                      <dd className="mt-0.5 text-ink">{request.requestedAtLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-faint">Move-in</dt>
                      <dd className="mt-0.5 text-ink">{request.moveInLabel}</dd>
                    </div>
                    <div>
                      <dt className="text-faint">Status</dt>
                      <dd className="mt-0.5 text-ink">{request.statusNote}</dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>

          <div className="mt-4">
            <Link href="/properties" className={buttonClasses("outline", "sm")}>
              <CalendarDays className="size-4" aria-hidden="true" />
              Start a new search
            </Link>
          </div>
        </section>

        {/* ---------------------------------------------------- profile */}
        <section aria-labelledby="profile" className="rounded-xl border border-line bg-surface p-5">
          <h2 id="profile" className="font-display text-xl font-semibold text-ink">
            Demo profile
          </h2>

          <dl className="mt-4 space-y-3.5 text-sm">
            <Row label="Name" value={student.name} />
            <Row label="Email" value={student.email} />
            <Row label="University" value={getUniversity(student.universityId).name} />
            <Row label="Course" value={student.course} />
            <Row label="Move-in window" value={student.moveInWindow} />
            <Row label="Budget" value={student.budgetNote} />
          </dl>

          <div className="mt-5 flex flex-wrap gap-2.5 border-t border-line pt-4">
            <Link href="/sign-in" className={buttonClasses("outline", "sm")}>
              Edit (demo)
            </Link>
            <Link href="/universities" className={buttonClasses("ghost", "sm")}>
              Pricing rules
            </Link>
          </div>
        </section>
      </div>

      {/* ---------------------------------------------------------- saved */}
      <section aria-labelledby="saved-heading" className="mt-12 border-t border-line pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="saved-heading" className="font-display text-xl font-semibold text-ink">
              Your shortlist
            </h2>
            <p className="mt-1 text-sm text-muted">
              {favouritesReady && saved.length > 0
                ? `${saved.length} saved demo ${saved.length === 1 ? "listing" : "listings"}.`
                : "Save listings from any card to see them here."}
            </p>
          </div>
          <Link href="/saved" className={buttonClasses("outline", "sm")}>
            Manage saved
          </Link>
        </div>

        <div className="mt-6">
          {favouritesReady && saved.length > 0 ? (
            <PropertyGrid properties={saved.slice(0, 3)} />
          ) : (
            <EmptyState
              icon={<Heart className="size-8" aria-hidden="true" />}
              title="Nothing saved yet"
              description="Head to search and tap the heart on a listing — it will show up here instantly."
              action={{ label: "Browse listings", href: "/properties" }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-surface-2 text-muted">
        {icon}
      </span>
      <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-faint uppercase">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs text-faint">{note}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-[0.12em] text-faint uppercase">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}
