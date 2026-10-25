import type { Metadata } from "next";
import { SavedPageClient } from "@/components/saved/saved-page-client";

export const metadata: Metadata = {
  title: "Saved properties",
  description: "Your shortlist of saved OFFK demo listings (stored in this browser only).",
};

export default function SavedPage() {
  return <SavedPageClient />;
}
