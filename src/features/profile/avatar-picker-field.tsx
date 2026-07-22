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
    <fieldset aria-describedby="child-avatar-description child-avatar-message">
      <legend className="text-lg font-black text-[#342f28]">{label}</legend>
      <p id="child-avatar-description" className="mt-1 text-sm leading-6 text-[#806d54]">
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
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
          role="alert"
        >
          {loadError}
        </div>
      ) : avatars.length ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {avatars.map((avatar) => {
            const selected = avatar.id === value;
            return (
              <label
                key={avatar.id}
                className={cn(
                  "relative grid cursor-pointer place-items-center rounded-2xl border-2 bg-[#fffdf8] p-2 transition focus-within:ring-2 focus-within:ring-[#e9641a] focus-within:ring-offset-2",
                  selected ? "border-[#e9641a] shadow-sm" : "border-[#eadfc9] hover:border-[#d7b77e]",
                )}
              >
                <input
                  type="radio"
                  name="avatarAssetId"
                  value={avatar.id}
                  checked={selected}
                  onChange={() => onChange(avatar.id)}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  aria-label={avatar.altText}
                />
                <Image
                  src={avatar.url}
                  width={96}
                  height={96}
                  alt=""
                  className="pointer-events-none aspect-square w-full rounded-full bg-[#f1eadc] object-contain"
                />
                {selected ? (
                  <CheckCircle2
                    size={22}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1 right-1 fill-white text-[#cf4f0d]"
                  />
                ) : null}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          {emptyMessage}
        </div>
      )}

      <p
        id="child-avatar-message"
        role={fieldError ? "alert" : undefined}
        className={cn("mt-2 min-h-5 text-sm font-bold", fieldError ? "text-red-700" : "text-transparent")}
      >
        {fieldError ?? "Không có lỗi"}
      </p>
    </fieldset>
  );
}
