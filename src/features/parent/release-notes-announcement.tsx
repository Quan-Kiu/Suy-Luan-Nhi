"use client";

import { ArrowRight, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, Pill } from "@/components/ui";
import { markReleaseNotesSeen, useHasUnseenReleaseNotes } from "@/features/parent/release-notes-seen";
import type { ReleaseNote } from "@/modules/release-notes/release-notes";

export function ReleaseNotesAnnouncement({ release }: { release: ReleaseNote | null }) {
  const pathname = usePathname();
  const hasUnseen = useHasUnseenReleaseNotes(release?.version ?? null);

  if (!release || !release.announcement || !hasUnseen || pathname === "/parent/whats-new") {
    return null;
  }

  return (
    <Card
      role="status"
      className="relative mb-5 overflow-hidden border-[#e6a35e] bg-[#fff6df] p-4 pr-12 shadow-none sm:p-5 sm:pr-14"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[#b9470d] shadow-sm">
          <Sparkles size={21} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="type-card-title">Có cập nhật mới</h2>
            <Pill className="border-[#e6a35e] bg-white py-1">{release.version}</Pill>
          </div>
          <p className="type-supporting mt-1 text-[#6f604b]">{release.summary}</p>
          <Link
            href="/parent/whats-new"
            onClick={() => markReleaseNotesSeen(release.version)}
            className="type-action mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#b9470d] px-4 py-2 text-white"
          >
            Xem thay đổi
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <button
        type="button"
        aria-label="Đánh dấu cập nhật này là đã xem"
        onClick={() => markReleaseNotesSeen(release.version)}
        className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-[#6f604b] transition hover:bg-white"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </Card>
  );
}
