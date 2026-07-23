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
  hideForStaff = false,
  onNavigate,
  className,
}: {
  content: ContentDictionary;
  compact?: boolean;
  hideForStaff?: boolean;
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
  const guest = state === "guest";

  if (staff && hideForStaff) return null;
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
            staff ? "header.adminAction" : parent ? "header.manageFamily" : "header.signIn",
            staff ? "Trang quản trị" : parent ? "Khu vực phụ huynh" : "Đăng nhập",
          )
        : contentText(
            content,
            staff ? "hero.adminCta" : parent ? "hero.parentCta" : "hero.startCta",
            staff ? "Mở trang quản trị" : parent ? "Vào khu vực phụ huynh" : "Bắt đầu cho bé",
          );

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        compact
          ? "rounded-full border border-[#e4d5ba] bg-white px-4 py-2 font-black"
          : "wood-button inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 py-3 font-black text-white",
        className,
      )}
    >
      {guest && !compact ? (
        <span className="flex flex-col items-start text-left leading-tight">
          <span>{label}</span>
          <span className="type-caption mt-1 font-bold text-white/85">
            {contentText(content, "hero.startHint", "Ba mẹ tạo tài khoản trước, sau đó thêm hồ sơ cho bé.")}
          </span>
        </span>
      ) : (
        label
      )}
      {!compact ? <ArrowRight size={20} className="shrink-0" /> : null}
    </Link>
  );
}
