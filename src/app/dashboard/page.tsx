import type { Metadata } from "next";
import { StudentDashboardClient } from "@/components/account/student-dashboard-client";

export const metadata: Metadata = {
  title: "Student dashboard",
  description: "Demo student dashboard: profile, shortlist and enquiry activity — sample data only.",
};

export default function StudentDashboardPage() {
  return <StudentDashboardClient />;
}
