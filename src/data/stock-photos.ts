import type { PropertyImage, RoomCapacity } from "../types/property";

/**
 * Licensed demo photography.
 *
 * Every image in this folder is stock photography downloaded from Pexels and
 * kept locally so the demo works offline. Pexels permits free use without
 * attribution; the source IDs and licence note are recorded in
 * `public/images/rooms/stock/README.md`.
 *
 * These are illustrative student-accommodation photos. They do NOT depict any
 * property in this dataset, and the alt text says so on every image.
 */

const CREDIT = "Pexels stock photo · illustrative only";

function photo(src: string, alt: string): PropertyImage {
  return { src, alt, kind: "photo", credit: CREDIT, isDemo: true };
}

const room = (file: string, scene: string) =>
  photo(
    `/images/rooms/stock/${file}.jpg`,
    `Demo stock photo of ${scene}. Illustrative only — not a photo of this specific room.`,
  );

export const STOCK_ROOM_PHOTOS: Record<RoomCapacity, PropertyImage[]> = {
  1: [
    room("room-1-a", "a single bed beside a wooden cabinet"),
    room("room-1-b", "a compact, freshly made single room"),
    room("room-1-c", "a single bedroom with soft daylight"),
  ],
  2: [
    room("room-2-a", "two single beds in a well-lit shared room"),
    room("room-2-b", "a twin room with matching beds and warm bedding"),
    room("room-2-c", "a twin bedroom with bedside storage"),
  ],
  3: [
    room("room-3-b", "a shared bedroom with multiple beds and soft textiles"),
    room("room-3-a", "a shared room with beds arranged for small groups"),
    room("room-3-c", "a compact shared bedroom with a wardrobe"),
  ],
  4: [
    room("room-4-a", "bunk beds in a tidy shared dormitory"),
    room("room-4-b", "a clean shared dormitory with bunk beds"),
  ],
  5: [
    room("room-5-a", "a hostel room with bunk beds and individual lighting"),
    room("room-5-b", "a shared dormitory with wooden bunk beds"),
  ],
  6: [
    room("room-6-a", "a simple shared bedroom with multiple beds"),
    room("room-5-b", "a shared dormitory with wooden bunk beds"),
  ],
};

export const STOCK_COMMON_PHOTOS = {
  livingA: photo(
    "/images/rooms/stock/shared-living-a.jpg",
    "Demo stock photo of a bright shared living room. Illustrative only — not this property.",
  ),
  livingB: photo(
    "/images/rooms/stock/shared-living-b.jpg",
    "Demo stock photo of a furnished shared lounge. Illustrative only — not this property.",
  ),
  kitchen: photo(
    "/images/rooms/stock/shared-kitchen-a.jpg",
    "Demo stock photo of a shared kitchen. Illustrative only — not this property.",
  ),
  bathroom: photo(
    "/images/rooms/stock/shared-bathroom-a.jpg",
    "Demo stock photo of a modern shared bathroom. Illustrative only — not this property.",
  ),
  study: photo(
    "/images/rooms/stock/study-a.jpg",
    "Demo stock photo of a study desk and chair. Illustrative only — not this property.",
  ),
} as const;

export const STOCK_EXTERIORS: PropertyImage[] = [
  photo(
    "/images/rooms/stock/exterior-a.jpg",
    "Demo stock photo of an apartment building exterior. Illustrative only — not this property.",
  ),
  photo(
    "/images/rooms/stock/exterior-b.jpg",
    "Demo stock photo of a residential building. Illustrative only — not this property.",
  ),
  photo(
    "/images/rooms/stock/exterior-c.jpg",
    "Demo stock photo of a modern apartment block. Illustrative only — not this property.",
  ),
  photo(
    "/images/rooms/stock/exterior-d.jpg",
    "Demo stock photo of a gated residential entrance. Illustrative only — not this property.",
  ),
  photo(
    "/images/rooms/stock/exterior-e.jpg",
    "Demo stock photo of a low-rise apartment exterior. Illustrative only — not this property.",
  ),
];

/** One unique cover per seed property; cycling is fine once the dataset grows. */
export function coverPhoto(index: number): PropertyImage {
  return STOCK_EXTERIORS[index % STOCK_EXTERIORS.length];
}

export function roomPhotosFor(capacity: RoomCapacity): PropertyImage[] {
  return STOCK_ROOM_PHOTOS[capacity];
}

/** Common-area photos appended to every property gallery. */
export function commonPhotos(includeKitchen = true): PropertyImage[] {
  return [
    STOCK_COMMON_PHOTOS.livingA,
    ...(includeKitchen ? [STOCK_COMMON_PHOTOS.kitchen] : []),
    STOCK_COMMON_PHOTOS.bathroom,
    STOCK_COMMON_PHOTOS.study,
  ];
}
