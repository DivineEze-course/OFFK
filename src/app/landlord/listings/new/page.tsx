import type { Metadata } from "next";
import { ListingWizard } from "@/components/landlord/listing-wizard";

export const metadata: Metadata = {
  title: "List a property (demo)",
  description:
    "A seven-step local demo listing flow with structured room configurations, Google Places location selection and browser-only photo uploads.",
};

export default function NewListingPage() {
  return <ListingWizard />;
}
