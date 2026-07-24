import type { Metadata } from "next";
import { BadgeCollectionPage } from "@/features/badges/badge-collection-page";

export const metadata: Metadata = {
  title: "Bộ sưu tập huy hiệu",
};

export default function BadgesPage() {
  return <BadgeCollectionPage />;
}
