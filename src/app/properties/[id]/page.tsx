import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, KeyRound, MessageSquare, UsersRound } from "lucide-react";
import { PROPERTIES, getProperty } from "@/data/properties";
import { getUniversity } from "@/data/universities";
import { ACCOMMODATION_TYPE_MAP, AMENITY_MAP, FURNISHING_MAP } from "@/data/meta";
import { formatStraightLineDistance, haversineKm } from "@/lib/distance";
import { RoomSelectionProvider } from "@/components/property/room-selection";
import { RoomMedia } from "@/components/property/room-media";
import { RoomSelector } from "@/components/property/room-selector";
import { RoomPriceBreakdown } from "@/components/property/room-price-breakdown";
import { EnquiryPanel } from "@/components/property/enquiry-panel";
import { DemoMap } from "@/components/map/demo-map";
import { AmenityIcon } from "@/components/properties/amenity-icon";
import { PropertyDistance } from "@/components/properties/property-distance";
import { SaveButton } from "@/components/properties/save-button";
import { DemoBadge, DemoNotice } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { UniversitySwitchHint } from "@/components/property/university-switch-hint";

/**
 * SSG paths for every demo listing. `params` is a Promise in this Next.js
 * version and must be awaited before use.
 */
export function generateStaticParams() {
  return PROPERTIES.map((property) => ({ id: property.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = getProperty(id);
  if (!property) return { title: "Listing not found" };
  return {
    title: property.title,
    description: `${property.title} in ${property.area} — demo listing on OFFK. Sample data only.`,
  };
}

export default async function PropertyDetailPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  const property = getProperty(id);
  if (!property) notFound();

  // The listing's primary university anchors the map and the static distance
  // summary; interactive pricing still follows the globally selected university.
  const primaryUniversity = getUniversity(property.universityIds[0]);
  const straightKm = haversineKm(primaryUniversity.coords, property.coords);
  const type = ACCOMMODATION_TYPE_MAP[property.type];
  const furnishing = FURNISHING_MAP[property.furnishing];

  return (
    <div className="page-container py-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-4">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to search
        </Link>
        <div className="flex items-center gap-2">
          <DemoBadge label="Sample listing" />
          <SaveButton propertyId={property.id} propertyTitle={property.title} />
        </div>
      </nav>

      <header className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              {property.area} · {type?.label} · {furnishing?.label}
            </p>
            <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {property.title}
            </h1>
            <PropertyDistance
              property={property}
              university={primaryUniversity}
              className="mt-3"
            />
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {property.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </header>

      <RoomSelectionProvider property={property}>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-12">
          {/* ------------------------------------------------ left column */}
          <div className="space-y-10">
            <RoomMedia />

            <RoomSelector />

            <section aria-labelledby="overview">
              <h2 id="overview" className="font-display text-xl font-semibold text-ink">
                About this listing
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
                {property.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
                <Fact label="Occupancy" value={property.occupancy.description} icon={<UsersRound className="size-4" aria-hidden="true" />} />
                <Fact label="Layout" value={`${property.occupancy.bedrooms} bedroom${property.occupancy.bedrooms === 1 ? "" : "s"} · ${property.occupancy.bathrooms} bathroom${property.occupancy.bathrooms === 1 ? "" : "s"}`} icon={<KeyRound className="size-4" aria-hidden="true" />} />
                <Fact label="Size" value={property.occupancy.sizeNote} icon={<Clock3 className="size-4" aria-hidden="true" />} />
                <Fact label="Furnishing" value={furnishing?.label ?? property.furnishing} icon={<MessageSquare className="size-4" aria-hidden="true" />} />
              </dl>
            </section>

            <section aria-labelledby="amenities">
              <h2 id="amenities" className="font-display text-xl font-semibold text-ink">
                Property-wide amenities
              </h2>
              <p className="mt-1 text-sm text-faint">
                These apply to the whole property. Amenities that belong to one room type are shown
                under that room above. Each item is a claim in the demo listing — confirm anything
                that matters to you.
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {property.amenities.map((amenityId) => {
                  const meta = AMENITY_MAP[amenityId];
                  if (!meta) return null;
                  return (
                    <li
                      key={amenityId}
                      className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5"
                    >
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                        <AmenityIcon amenity={amenityId} className="size-4.5" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-ink">{meta.label}</span>
                        <span className="mt-0.5 block text-xs text-faint">{meta.note}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section aria-labelledby="rules">
              <h2 id="rules" className="font-display text-xl font-semibold text-ink">
                House rules
              </h2>
              <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                {property.houseRules.map((rule) => (
                  <div key={rule.id} className="px-5 py-4">
                    <h3 className="text-sm font-semibold text-ink">{rule.label}</h3>
                    <p className="mt-1 text-sm text-muted">{rule.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="location">
              <h2 id="location" className="font-display text-xl font-semibold text-ink">
                Location &amp; distance
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                {primaryUniversity.coordinateNote}
              </p>

              <div className="mt-4">
                <DemoMap property={property} university={primaryUniversity} />
              </div>

              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-surface p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
                    Straight-line distance
                  </p>
                  <p className="font-display mt-2 text-2xl font-bold tracking-tight text-ink">
                    {formatStraightLineDistance(straightKm)}
                  </p>
                  <p className="mt-1 text-xs text-faint">
                    Illustrative distance between two demo pins, measured with the Haversine formula.
                    This is <strong className="font-semibold">not</strong> a walking, driving or
                    transit distance.
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-surface p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
                    Nearby landmarks (sample)
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {property.nearbyLandmarks.map((landmark) => (
                      <li key={landmark.name} className="text-sm">
                        <span className="font-medium text-ink">{landmark.name}</span>
                        <span className="block text-xs text-faint">{landmark.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section aria-labelledby="owner" className="rounded-xl border border-line bg-surface p-5">
              <h2 id="owner" className="font-display text-xl font-semibold text-ink">
                Listed by
              </h2>
              <div className="mt-4 flex items-start gap-4">
                <span className="font-display inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-btn-primary-bg text-base font-bold text-btn-primary-fg">
                  {property.owner.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{property.owner.name}</p>
                  <p className="text-sm text-muted">
                    {property.owner.role} · {property.owner.joinedLabel}
                  </p>
                  <p className="mt-1 text-xs text-faint">{property.owner.responseNote}</p>
                  <p className="mt-1 text-xs text-faint">{property.owner.contactLabel}</p>
                </div>
              </div>
              <div className="mt-4">
                <DemoNotice title="Demo profile">
                  Landlord identity, response time and contact details on this page are invented for
                  the template.
                </DemoNotice>
              </div>
            </section>
          </div>

          {/* ------------------------------------------------ right column */}
          <aside className="space-y-6">
            <UniversitySwitchHint />
            <RoomPriceBreakdown />
            <EnquiryPanel property={property} />

            <div className="rounded-xl border border-line bg-surface p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
                Availability
              </p>
              <p className="mt-2 text-sm font-medium text-ink">{property.availability.label}</p>
              <p className="mt-1 text-sm text-muted">{property.availability.note}</p>
              <p className="mt-3 text-xs text-faint">
                Sample availability for this demo listing — units, waitlists and dates are not real.
              </p>
            </div>

            <Link href="/properties" className={buttonClasses("outline", "md", "w-full")}>
              Compare more sample listings
            </Link>
          </aside>
        </div>
      </RoomSelectionProvider>

      {/* University-served note */}
      <div className="mt-12 border-t border-line pt-6">
        <p className="text-xs text-faint">
          Served at:{" "}
          {property.universityIds
            .map((universityId) => getUniversity(universityId).shortName)
            .join(" · ")}{" "}
          — demo availability. Prices on this page re-quote to whichever university is selected in
          the header.
        </p>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 bg-surface px-5 py-4">
      <span className="mt-0.5 text-faint">{icon}</span>
      <div>
        <dt className="text-xs font-semibold tracking-[0.12em] text-faint uppercase">{label}</dt>
        <dd className="mt-1 text-sm text-ink">{value}</dd>
      </div>
    </div>
  );
}
