"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import Image from "next/image";
import type { ChildAvatarOption } from "@/api/child-avatars";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  description: string;
  avatars: ChildAvatarOption[];
  value: string;
  onChange: (avatarAssetId: string) => void;
  loading: boolean;
  loadingLabel: string;
  emptyMessage: string;
  loadError?: string;
  fieldError?: string;
};

export function AvatarPickerField({
  label,
  description,
  avatars,
  value,
  onChange,
  loading,
  loadingLabel,
  emptyMessage,
  loadError,
  fieldError,
}: Props) {
  return (
    <fieldset
      aria-describedby={
        fieldError ? "child-avatar-description child-avatar-message" : "child-avatar-description"
      }
    >
      <legend className="type-section-title text-[#342f28]">{label}</legend>
      <p id="child-avatar-description" className="type-supporting mt-1 text-[#806d54]">
        {description}
      </p>

      {loading ? (
        <div className="mt-4 grid min-h-28 place-items-center rounded-2xl border border-dashed border-[#d9c9ae] bg-[#fffdf8]">
          <span className="inline-flex items-center gap-2 font-bold text-[#6f604b]">
            <LoaderCircle size={18} className="animate-spin" /> {loadingLabel}
          </span>
        </div>
      ) : loadError ? (
        <div
          className="type-label mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-800"
          role="alert"
        >
          {loadError}
        </div>
      ) : avatars.length ? (
        <div
          className="mt-4 grid grid-cols-4 gap-2.5 sm:grid-cols-5 sm:gap-3"
          data-testid="child-avatar-options"
        >
          {avatars.map((avatar) => {
            const selected = avatar.id === value;
            return (
              <label
                key={avatar.id}
                className={cn(
                  "relative grid aspect-square min-w-0 cursor-pointer place-items-center overflow-hidden rounded-[20px] border-2 bg-[#fffdf8] p-1.5 transition focus-within:ring-2 focus-within:ring-[#e9641a] focus-within:ring-offset-2 active:scale-[0.98]",
                  selected
                    ? "border-[#e9641a] bg-[#fff7ec] shadow-[0_5px_0_rgba(185,71,13,0.16)]"
                    : "border-[#eadfc9] hover:border-[#d7b77e]",
                )}
              >
                <input
                  type="radio"
                  name="avatarAssetId"
                  value={avatar.id}
                  checked={selected}
                  onChange={() => onChange(avatar.id)}
                  className="absolute inset-0 z-10 m-0 size-full cursor-pointer appearance-none"
                  style={{ opacity: 0 }}
                  aria-label={avatar.altText}
                />
                <Image
                  src={avatar.url}
                  width={96}
                  height={96}
                  alt=""
                  className="pointer-events-none size-full rounded-[15px] bg-[#f1eadc] object-contain"
                />
                {selected ? (
                  <span className="pointer-events-none absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-[#cf4f0d] text-white shadow-sm">
                    <CheckCircle2 size={15} strokeWidth={3} aria-hidden="true" />
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="type-label mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-900">
          {emptyMessage}
        </div>
      )}

      {fieldError ? (
        <p id="child-avatar-message" role="alert" className="type-supporting mt-2 font-bold text-red-700">
          {fieldError}
        </p>
      ) : null}
    </fieldset>
  );
}
