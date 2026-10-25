import type { Metadata } from "next";
import { UniversitiesPageClient } from "@/components/university/universities-page-client";

export const metadata: Metadata = {
  title: "Universities & pricing models",
  description:
    "How OFFK quotes rent for each supported university: semester-based Nile University and trimester-based Baze University demo models.",
};

export default function UniversitiesPage() {
  return <UniversitiesPageClient />;
}
