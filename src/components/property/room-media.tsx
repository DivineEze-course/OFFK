"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { NO_ROOM_PHOTOS_MESSAGE, roomPhotoSet } from "@/lib/rooms";
import { PropertyGallery } from "@/components/property/property-gallery";
import { useRoomSelection } from "@/components/property/room-selection";
import { cn } from "@/lib/cn";

type MediaTab = "room" | "building";

/**
 * Property media with a clear split between "this room type" and "the building
 * and shared areas". The room tab shows only the selected room's own photos —
 * if it has none, it says so instead of borrowing another room's picture.
 */
export function RoomMedia() {
  const { property, selectedRoom } = useRoomSelection();
  const [tab, setTab] = useState<MediaTab>("room");

  const roomPhotos = roomPhotoSet(selectedRoom);
  const hasRooms = selectedRoom != null;
  // A property with no room configurations has nothing to put on the room tab.
  const activeTab: MediaTab = hasRooms ? tab : "building";

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label="Photo sets" className="flex flex-wrap gap-2">
        {hasRooms ? (
          <TabButton
            id="media-tab-room"
            selected={activeTab === "room"}
            onClick={() => setTab("room")}
          >
            {selectedRoom.name}
            <span className="ml-1.5 text-xs font-normal text-faint">
              ({roomPhotos.photos.length} {roomPhotos.photos.length === 1 ? "photo" : "photos"})
            </span>
          </TabButton>
        ) : null}
        <TabButton
          id="media-tab-building"
          selected={activeTab === "building"}
          onClick={() => setTab("building")}
        >
          Building &amp; shared areas
          <span className="ml-1.5 text-xs font-normal text-faint">({property.images.length})</span>
        </TabButton>
      </div>

      <div role="tabpanel" aria-labelledby={`media-tab-${activeTab}`}>
        {activeTab === "room" && selectedRoom ? (
          roomPhotos.isEmpty ? (
            <div className="flex aspect-16/10 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-surface-2 p-6 text-center">
              <ImageOff className="size-8 text-faint" aria-hidden="true" />
              <p className="text-sm font-medium text-ink">{NO_ROOM_PHOTOS_MESSAGE}</p>
              <p className="max-w-sm text-xs text-faint">
                {selectedRoom.name} has no photographs of its own. Building and shared-area photos
                are on the next tab, but they do not show this room.
              </p>
            </div>
          ) : (
            // Re-keyed so the active thumbnail resets whenever the room changes.
            <PropertyGallery
              key={selectedRoom.id}
              images={roomPhotos.photos}
              title={`${property.title} — ${selectedRoom.name}`}
            />
          )
        ) : (
          <PropertyGallery key="building" images={property.images} title={property.title} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  id,
  selected,
  onClick,
  children,
}: {
  id: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center rounded-lg border px-3.5 text-sm font-medium transition-colors",
        selected
          ? "border-btn-primary-bg bg-btn-primary-bg text-btn-primary-fg"
          : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
