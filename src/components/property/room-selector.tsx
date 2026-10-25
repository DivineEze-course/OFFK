"use client";

import { BedDouble, Bath, Sofa, UsersRound } from "lucide-react";
import type { RoomConfiguration } from "@/types/property";
import { AMENITY_MAP, FURNISHING_MAP } from "@/data/meta";
import {
  bathroomLabel,
  pricingBasisLabel,
  roomAvailability,
  roomBedsLabel,
  roomQuote,
  spacesSummary,
} from "@/lib/rooms";
import { formatNaira } from "@/lib/format-currency";
import { AmenityIcon } from "@/components/properties/amenity-icon";
import { useRoomSelection } from "@/components/property/room-selection";
import { useUniversity } from "@/components/university/university-provider";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

/**
 * Room-type picker plus the details of whichever room is selected. Selecting a
 * room here is what moves the gallery, price card and enquiry form.
 */
export function RoomSelector() {
  const { rooms, selectedRoom, selectRoom } = useRoomSelection();
  const { university, period } = useUniversity();
  const periodLabel =
    university.rentalPeriods.find((option) => option.id === period)?.shortLabel.toLowerCase() ??
    "period";

  if (rooms.length === 0) {
    return (
      <section aria-labelledby="rooms">
        <h2 id="rooms" className="font-display text-xl font-semibold text-ink">
          Room types
        </h2>
        <p className="mt-3 rounded-xl border border-dashed border-line bg-surface-2 p-5 text-sm text-muted">
          This listing has not added any room types yet, so there are no room photos, prices or
          spaces to show.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="rooms">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="rooms" className="font-display text-xl font-semibold text-ink">
            Room types
          </h2>
          <p className="mt-1 text-sm text-muted">
            Choose a room type — photos, price, spaces and amenities below all follow it.
          </p>
        </div>
        <DemoBadge label="Sample room data" />
      </div>

      <ul aria-label="Room types" className="mt-4 grid gap-3 sm:grid-cols-2">
        {rooms.map((room) => {
          const selected = room.id === selectedRoom?.id;
          const availability = roomAvailability(room);
          const quote = roomQuote(room, university.id, period, university);

          return (
            <li key={room.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => selectRoom(room.id)}
                className={cn(
                  "flex h-full w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  selected
                    ? "border-btn-primary-bg bg-surface ring-2 ring-accent"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{room.name}</span>
                  <Badge tone={availability.tone}>{availability.label}</Badge>
                </span>
                <span className="text-xs text-faint">
                  Capacity {room.capacity} · {roomBedsLabel(room)}
                </span>
                {quote ? (
                  <span className="mt-auto pt-1">
                    <span className="font-display text-lg font-bold tracking-tight text-ink">
                      {formatNaira(quote.headlineAmount)}
                    </span>{" "}
                    <span className="text-xs text-muted">
                      {pricingBasisLabel(quote.basis)} · per {periodLabel}
                    </span>
                  </span>
                ) : (
                  <span className="mt-auto pt-1 text-xs text-muted">
                    No {periodLabel} rate listed for this room
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {selectedRoom ? <SelectedRoomDetails room={selectedRoom} /> : null}
    </section>
  );
}

function SelectedRoomDetails({ room }: { room: RoomConfiguration }) {
  const availability = roomAvailability(room);
  const furnishing = FURNISHING_MAP[room.furnishing]?.label ?? room.furnishing;

  return (
    <div aria-live="polite" className="mt-5 rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">{room.name}</h3>
          <p className="mt-0.5 text-sm text-muted">{spacesSummary(room)}</p>
        </div>
        <Badge tone={availability.tone}>{availability.label}</Badge>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{room.description}</p>

      <dl className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
        <Detail
          icon={<UsersRound className="size-4" aria-hidden="true" />}
          label="Capacity"
          value={`${room.capacity} ${room.capacity === 1 ? "person" : "people"} per room${
            room.maxOccupancy !== room.capacity ? ` (max ${room.maxOccupancy})` : ""
          }`}
        />
        <Detail
          icon={<BedDouble className="size-4" aria-hidden="true" />}
          label="Beds"
          value={roomBedsLabel(room)}
        />
        <Detail
          icon={<Bath className="size-4" aria-hidden="true" />}
          label="Bathroom"
          value={`${bathroomLabel(room.bathroom)}${room.bathroomNote ? ` — ${room.bathroomNote}` : ""}`}
        />
        <Detail
          icon={<Sofa className="size-4" aria-hidden="true" />}
          label="Furnishing"
          value={furnishing}
        />
        {room.availability.totalRooms != null ? (
          <Detail
            icon={<UsersRound className="size-4" aria-hidden="true" />}
            label="Rooms of this type"
            value={`${room.availability.totalRooms} in total${
              room.availability.availableRooms != null
                ? ` · ${room.availability.availableRooms} with a free space`
                : ""
            }`}
          />
        ) : null}
      </dl>

      <div className="mt-5">
        <h4 className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
          In this room
        </h4>
        {room.amenities.length > 0 ? (
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {room.amenities.map((amenityId) => {
              const meta = AMENITY_MAP[amenityId];
              if (!meta) return null;
              return (
                <li key={amenityId} className="flex items-center gap-2.5 text-sm text-ink">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                    <AmenityIcon amenity={amenityId} className="size-4" />
                  </span>
                  {meta.label}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-faint">
            No room-specific amenities are listed. Property-wide amenities are shown further down
            the page.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-faint">{room.availability.note}</p>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-surface px-4 py-3">
      <span className="mt-0.5 text-faint">{icon}</span>
      <div>
        <dt className="text-xs font-semibold tracking-[0.12em] text-faint uppercase">{label}</dt>
        <dd className="mt-0.5 text-sm text-ink">{value}</dd>
      </div>
    </div>
  );
}
