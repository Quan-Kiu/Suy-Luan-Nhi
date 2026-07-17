"use client";

import { BarChart3, Bell, BookOpen, Home, Lightbulb, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/auth/client";
import { contentText, useContent } from "@/content/client";
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

export function ParentNav({ unread = 0 }: { unread?: number }) {
  const content = useContent("parent");
  const pathname = usePathname();
  const router = useRouter();
  const links = items.map((item) => ({ ...item, label: contentText(content, item.labelKey, item.fallback) }));

  return (
    <>
      <nav className="sticky top-0 z-30 hidden border-b border-[#eadfc9] bg-[#fffaf0]/95 px-5 py-3 backdrop-blur sm:block">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          {links.map(({ href, label, icon: Icon, exact = false }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold",
                isActive(pathname, href, exact) && "bg-[#fff0df] text-[#d95812]",
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
              <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-red-600 text-[10px] text-white">
                {Math.min(unread, 9)}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.push("/");
              router.refresh();
            }}
            className="grid size-10 place-items-center rounded-full border"
            aria-label={contentText(content, "nav.logout", "Đăng xuất")}
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-20 max-w-[520px] items-center justify-around border-t border-[#eadfc9] bg-[#fffaf0]/95 px-2 backdrop-blur sm:hidden">
        {links.map(({ href, label, icon: Icon, exact = false }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "text-center text-[11px] font-bold",
              isActive(pathname, href, exact) && "text-[#e9641a]",
            )}
          >
            <Icon className="mx-auto" size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
