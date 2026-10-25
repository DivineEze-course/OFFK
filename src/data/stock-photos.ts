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

/**
 * Stock photos cannot show how many beds a specific room has, so every photo
 * is shown with an "Illustrative stock photo" badge. The alt text below
 * describes only what is actually visible in each file — it does not claim the
 * photo matches the room's capacity. No file is reused across capacities, so
 * switching room type always switches the picture.
 */
export const STOCK_ROOM_PHOTOS: Record<RoomCapacity, PropertyImage[]> = {
  1: [
    room("room-1-a", "a large hotel-style bedroom with a double bed and wooden wardrobes"),
    room("room-1-b", "a close-up of a made bed with white linen and a wall light"),
    room("room-1-c", "a hotel-style bedroom with a double bed and a dark headboard"),
  ],
  2: [
    room("room-2-a", "two single beds with grey headboards in a bright bedroom"),
    room("room-2-b", "two beds with grey patterned headboards, a bedside lamp and a folded towel arrangement"),
    room("room-2-c", "twin beds with wooden headboards, a bedside table and a folded bathrobe"),
  ],
  3: [
    room("room-3-b", "a bedroom with two beds, colourful bedding and a wooden desk"),
    room("room-3-a", "a bedroom with two single beds and folded towels against a patterned wall"),
    room("room-3-c", "a bedroom with a bed in yellow sheets beside a wooden wardrobe"),
  ],
  4: [
    room("room-4-a", "white bunk beds with clothes hanging beside them"),
    room("room-4-b", "white bunk beds with curtains in a hostel-style dormitory"),
  ],
  5: [
    room("room-5-a", "a numbered dormitory door beside white bunk beds"),
    room("room-5-b", "a large dormitory with rows of wooden bunk beds"),
  ],
  6: [
    room("room-6-a", "an empty bedroom with a ceiling fan, a wardrobe opening and wood flooring"),
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
