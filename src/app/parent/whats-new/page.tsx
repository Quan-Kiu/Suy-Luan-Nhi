import type { Metadata } from "next";
import { ReleaseNotesPage } from "@/features/parent/release-notes-page";
import { listPublishedReleaseNotes } from "@/modules/release-notes/release-notes";

export const metadata: Metadata = {
  title: "Có gì mới",
  description: "Những thay đổi mới và quan trọng dành cho gia đình trong Suy Luận Nhí.",
};

export default function Page() {
  return <ReleaseNotesPage releases={listPublishedReleaseNotes()} />;
}
