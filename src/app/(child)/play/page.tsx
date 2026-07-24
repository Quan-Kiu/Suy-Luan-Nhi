import type { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Lượt chơi",
};

export default function Page() {
  redirect("/missions");
}
