"use client";

import { BarChart3, Bell, BookOpen, Home, Lightbulb, LoaderCircle, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { contentText, useContent } from "@/content/client";
import { useSignOutNavigation } from "@/features/auth/use-sign-out-navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/parent", labelKey: "nav.overview", fallback: "Tổng quan", icon: Home, exact: true },
  {
    href: "/parent/activity",
    labelKey: "nav.activity",
    fallback: "Hoạt động",
    icon: BarChart3,
    exact: false,
  },
  {
    href: "/parent/suggestions",
    labelKey: "nav.suggestions",
    fallback: "Gợi ý",
    icon: Lightbulb,
    exact: false,
  },
  {
    href: "/parent/resources",
    labelKey: "nav.resources",
    fallback: "Tài nguyên",
    icon: BookOpen,
    exact: false,
  },
  { href: "/parent/settings", labelKey: "nav.settings", fallback: "Cài đặt", icon: Settings, exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function ParentNav({
  unread = 0,
  resourcesEnabled = true,
}: {
  unread?: number;
  resourcesEnabled?: boolean;
}) {
  const content = useContent("parent");
  const pathname = usePathname();
  const signOutFlow = useSignOutNavigation("/");
  const visibleItems = resourcesEnabled ? items : items.filter((item) => item.href !== "/parent/resources");
  const links = visibleItems.map((item) => ({
    ...item,
    label: contentText(content, item.labelKey, item.fallback),
  }));

  return (
    <>
      <nav className="sticky top-16 z-40 hidden border-b border-[#eadfc9] bg-[#fffaf0]/95 px-5 py-3 backdrop-blur sm:block">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          {links.map(({ href, label, icon: Icon, exact = false }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "type-action flex items-center gap-2 rounded-xl px-3 py-2",
                isActive(pathname, href, exact) && "bg-[#fff0df] text-[#bd4910]",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <Link
            href="/parent/notifications"
            aria-label={contentText(content, "nav.notifications", "Thông báo")}
            className="relative ml-auto grid size-10 place-items-center rounded-full border"
          >
            <Bell size={18} />
            {unread > 0 ? (
              <span className="type-caption absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-red-600 leading-none text-white">
                {Math.min(unread, 9)}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            disabled={signOutFlow.pending}
            aria-busy={signOutFlow.pending}
            onClick={() => void signOutFlow.signOutAndNavigate()}
            className="grid size-10 place-items-center rounded-full border"
            aria-label={contentText(content, "nav.logout", "Đăng xuất")}
          >
            {signOutFlow.pending ? <LoaderCircle size={18} className="animate-spin" /> : <LogOut size={18} />}
          </button>
        </div>
      </nav>
      <nav className="safe-area-bottom-nav fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[520px] items-center justify-around border-t border-[#eadfc9] bg-[#fffaf0]/95 backdrop-blur sm:hidden">
        {links.map(({ href, label, icon: Icon, exact = false }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "type-caption flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-center",
              isActive(pathname, href, exact) && "text-[#bd4910]",
            )}
          >
            <Icon className="shrink-0" size={20} />
            <span className="block max-w-[74px] leading-[1.15] text-balance">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
