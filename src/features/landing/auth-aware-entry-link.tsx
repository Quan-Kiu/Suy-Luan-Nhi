"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/auth/client";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { resolveLandingEntryState } from "@/features/landing/landing-entry-state";
import { cn } from "@/lib/utils";

export function AuthAwareEntryLink({
  content,
  compact = false,
  onNavigate,
  className,
}: {
  content: ContentDictionary;
  compact?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const session = useSession();
  const state = resolveLandingEntryState({
    isPending: session.isPending,
    isRefetching: session.isRefetching,
    hasUser: Boolean(session.data?.user),
    role: session.data?.user.role,
  });

  if (state === "loading") {
    return (
      <span
        role="status"
        aria-label="Đang kiểm tra tài khoản..."
        className={cn(
          "animate-pulse border border-[#e4d5ba] bg-[#f1e8d8]",
          compact ? "h-10 w-36 rounded-full" : "h-14 w-52 rounded-2xl",
          className,
        )}
      />
    );
  }

  const staff = state === "staff";
  const parent = state === "parent";
  const href = staff
    ? "/admin"
    : parent
      ? "/parent"
      : state === "forbidden"
        ? "/auth/error?reason=forbidden"
        : compact
          ? "/auth/sign-in"
          : "/auth/sign-up";
  const label =
    state === "forbidden"
      ? "Kiểm tra quyền truy cập"
      : compact
        ? contentText(
            content,
            staff ? "header.admin" : "header.parent",
            staff ? "Khu vực quản trị" : "Khu vực phụ huynh",
          )
        : contentText(
            content,
            staff ? "hero.adminCta" : parent ? "hero.parentCta" : "hero.primaryCta",
            staff ? "Mở trang quản trị" : parent ? "Vào khu vực phụ huynh" : "Tạo hồ sơ cho bé",
          );

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        compact
          ? "rounded-full border border-[#e4d5ba] bg-white px-4 py-2 font-black"
          : "wood-button inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-6 font-black text-white",
        className,
      )}
    >
      {label}
      {!compact ? <ArrowRight size={20} /> : null}
    </Link>
  );
}
