import type { Metadata } from "next";
import { MissionMapPage } from "@/features/catalog/mission-map-page";

export const metadata: Metadata = {
  title: "Bản đồ nhiệm vụ",
};

export default function Page() {
  return <MissionMapPage />;
}
