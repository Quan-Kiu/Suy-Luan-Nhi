import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Hoạt động của bé",
};

export default function LegacyActivitiesPage() {
  redirect("/parent/activity");
}
