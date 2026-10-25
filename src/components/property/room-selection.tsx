"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Property, RoomConfiguration } from "@/types/property";
import { defaultRoom, sortRooms } from "@/lib/rooms";
import { useUniversity } from "@/components/university/university-provider";

interface RoomSelectionValue {
  property: Property;
  /** Rooms in display order (capacity, then grade). */
  rooms: RoomConfiguration[];
  /** `undefined` only when the property has no room configurations. */
  selectedRoom: RoomConfiguration | undefined;
  /** `true` once the student has picked a room themselves. */
  hasChosen: boolean;
  selectRoom: (roomId: string) => void;
}

const RoomSelectionContext = createContext<RoomSelectionValue | null>(null);

/**
 * Holds "which room type is the student looking at?" for one property page.
 *
 * Every room-dependent part of the page (gallery, room details, price,
 * availability, enquiry form) reads this one value, so they can never disagree.
 * Until the student chooses, the room follows the same default the pricing
 * engine would pick for the selected university and rental period.
 */
export function RoomSelectionProvider({
  property,
  children,
}: {
  property: Property;
  children: React.ReactNode;
}) {
  const { university, period } = useUniversity();
  const rooms = useMemo(() => sortRooms(property.rooms), [property.rooms]);
  const [chosenId, setChosenId] = useState<string | null>(null);

  const chosen = chosenId ? rooms.find((room) => room.id === chosenId) : undefined;
  const selectedRoom =
    chosen ?? defaultRoom(property, university.id, period, university) ?? rooms[0];

  const selectRoom = useCallback((roomId: string) => setChosenId(roomId), []);

  const value = useMemo<RoomSelectionValue>(
    () => ({ property, rooms, selectedRoom, hasChosen: chosen != null, selectRoom }),
    [property, rooms, selectedRoom, chosen, selectRoom],
  );

  return <RoomSelectionContext.Provider value={value}>{children}</RoomSelectionContext.Provider>;
}

export function useRoomSelection(): RoomSelectionValue {
  const context = useContext(RoomSelectionContext);
  if (!context) throw new Error("useRoomSelection must be used inside <RoomSelectionProvider>");
  return context;
}
