import {
  Accessibility,
  Armchair,
  Bath,
  BedDouble,
  BedSingle,
  Bike,
  BookOpen,
  BatteryCharging,
  Camera,
  Car,
  CookingPot,
  Droplets,
  Dumbbell,
  Fan,
  FireExtinguisher,
  LampDesk,
  Lock,
  Microwave,
  Plug,
  Refrigerator,
  ShieldCheck,
  ShowerHead,
  Sofa,
  Table,
  Utensils,
  WashingMachine,
  Waves,
  Wifi,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { AmenityId } from "@/types/property";

/** Amenity id → Lucide icon. Kept in one place so amenity lists stay declarative. */
export const AMENITY_ICONS: Record<AmenityId, LucideIcon> = {
  wifi: Wifi,
  power: Zap,
  generator: BatteryCharging,
  water: Droplets,
  borehole: Droplets,
  furnished: BedDouble,
  kitchen: CookingPot,
  "private-bathroom": Bath,
  "shared-bathroom": ShowerHead,
  security: ShieldCheck,
  cctv: Camera,
  parking: Car,
  laundry: WashingMachine,
  "air-conditioning": Wind,
  "study-area": BookOpen,
  desk: Table,
  wardrobe: Lock,
  "reading-lamp": LampDesk,
  fan: Fan,
  locker: Lock,
  balcony: Waves,
  "water-heater": Bath,
  microwave: Microwave,
  refrigerator: Refrigerator,
  cooktop: Plug,
  cleaning: Sofa,
  "common-room": Armchair,
  gym: Dumbbell,
  "bicycle-storage": Bike,
  accessible: Accessibility,
  "fire-safety": FireExtinguisher,
};

/** Fallback for amenities without a dedicated icon. */
export const DEFAULT_AMENITY_ICON = Utensils;

/** Renders the icon for an amenity id, falling back to a generic one. */
export function AmenityIcon({
  amenity,
  className,
}: {
  amenity: AmenityId;
  className?: string;
}) {
  const Icon = AMENITY_ICONS[amenity] ?? DEFAULT_AMENITY_ICON;
  return <Icon className={className} aria-hidden="true" />;
}

/** Small helper for places that only have a bed count and want an icon. */
export const BED_ICON = BedSingle;
