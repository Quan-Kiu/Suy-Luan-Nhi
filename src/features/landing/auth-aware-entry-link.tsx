"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/auth/client";
import { getAuthenticatedHome } from "@/auth/navigation";
import { hasRole, staffRoles } from "@/auth/roles";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
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
  const role = session.data?.user.role;
  const signedIn = Boolean(session.data?.user);
  const staff = hasRole(role, staffRoles);
  const href = signedIn ? getAuthenticatedHome(role) : compact ? "/auth/sign-in" : "/auth/sign-up";
  const label = compact
    ? signedIn
      ? contentText(
          content,
          staff ? "header.admin" : "header.parent",
          staff ? "Khu vực quản trị" : "Khu vực phụ huynh",
        )
      : contentText(content, "header.parent", "Khu vực phụ huynh")
    : signedIn
      ? contentText(
          content,
          staff ? "hero.adminCta" : "hero.parentCta",
          staff ? "Mở trang quản trị" : "Vào khu vực phụ huynh",
        )
      : contentText(content, "hero.primaryCta", "Tạo hồ sơ cho bé");

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
