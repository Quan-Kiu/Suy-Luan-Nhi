import type { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Hoàn thành nhiệm vụ",
};

export default function Page() {
  redirect("/missions");
}
