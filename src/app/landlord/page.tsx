import type { Metadata } from "next";
import { LandlordPageClient } from "@/components/landlord/landlord-page-client";

export const metadata: Metadata = {
  title: "For landlords",
  description:
    "List demo student accommodation and track sample enquiries — the OFFK landlord workspace (frontend demo only).",
};

export default function LandlordPage() {
  return <LandlordPageClient />;
}
