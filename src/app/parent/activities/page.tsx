import { redirect } from "next/navigation";

export default function LegacyActivitiesPage() {
  redirect("/parent/activity");
}
