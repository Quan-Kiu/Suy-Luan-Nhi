"use client";

import { ChevronDown, RotateCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProfileListItem } from "@/features/profile/profile-card";

export type DeletedProfileListItem = ProfileListItem & {
  deletionRequestedAt: string;
};

type ProfileTrashLabels = {
  title: string;
  description: string;
  deletedAt: string;
  restore: string;
  deleteForever: string;
};

type ProfileTrashProps = {
  profiles: DeletedProfileListItem[];
  open: boolean;
  pendingId: string | null;
  labels: ProfileTrashLabels;
  onToggle: () => void;
  onRestore: (profile: DeletedProfileListItem) => void;
  onDeleteForever: (profile: DeletedProfileListItem) => void;
};
const deletedDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function ProfileTrash({
  profiles,
  open,
  pendingId,
  labels,
  onToggle,
  onRestore,
  onDeleteForever,
}: ProfileTrashProps) {
  if (!profiles.length) return null;
  const regionId = "deleted-child-profiles";

  return (
    <section className="overflow-hidden rounded-2xl border border-[#dfd2bc] bg-[#fffdf8]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={regionId}
        className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f2ece2] text-[#6f604b]">
          <Trash2 size={20} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="type-card-title flex flex-wrap items-center gap-2 text-[#342f28]">
            {labels.title}
            <span className="type-caption rounded-full bg-[#eee5d7] px-2.5 py-1 text-[#6f604b]">
              {profiles.length}
            </span>
          </span>
          <span className="type-supporting mt-1 block text-[#806d54]">{labels.description}</span>
        </span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={cn("shrink-0 text-[#806d54] transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div id={regionId} className="border-t border-[#eadfc9] p-3 sm:p-4">
          <ul className="space-y-3">
            {profiles.map((profile) => {
              const pending = pendingId === profile.id;
              return (
                <li
                  key={profile.id}
                  className="grid gap-3 rounded-2xl border border-[#eadfc9] bg-white p-3 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center sm:p-4"
                >
                  <Image
                    src={profile.avatarUrl}
                    width={56}
                    height={56}
                    alt=""
                    className="size-14 rounded-full bg-[#f1eadc] object-contain"
                  />
                  <div className="min-w-0">
                    <p className="type-card-title truncate text-[#342f28]">{profile.displayName}</p>
                    <p className="type-caption mt-1 text-[#806d54]">
                      {labels.deletedAt} {deletedDateFormatter.format(new Date(profile.deletionRequestedAt))}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onRestore(profile)}
                      aria-label={`${labels.restore} hồ sơ ${profile.displayName}`}
                      className="type-action inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#b9470d] px-3 text-white disabled:opacity-50"
                    >
                      <RotateCcw size={16} aria-hidden="true" />
                      {labels.restore}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onDeleteForever(profile)}
                      aria-label={`${labels.deleteForever} hồ sơ ${profile.displayName}`}
                      className="type-action inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      {labels.deleteForever}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
