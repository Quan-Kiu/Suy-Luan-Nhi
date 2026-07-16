"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Bell, BookOpen, Home, Lightbulb, LogOut, Settings } from "lucide-react";
import { signOut } from "@/auth/client";
import { cn } from "@/lib/utils";
const items = [
  [/parent$/, "/parent", "Tổng quan", Home],
  [/activity/, "/parent/activity", "Hoạt động", BarChart3],
  [/suggestions/, "/parent/suggestions", "Gợi ý", Lightbulb],
  [/resources/, "/parent/resources", "Tài nguyên", BookOpen],
  [/settings/, "/parent/settings", "Cài đặt", Settings],
] as const;
export function ParentNav({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <>
      <nav className="sticky top-0 z-30 hidden border-b border-[#eadfc9] bg-[#fffaf0]/95 px-5 py-3 backdrop-blur sm:block">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          {items.map(([matcher, href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold",
                matcher.test(pathname) && "bg-[#fff0df] text-[#d95812]",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <Link
            href="/parent/notifications"
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
            aria-label="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-20 max-w-[520px] items-center justify-around border-t border-[#eadfc9] bg-[#fffaf0]/95 px-2 backdrop-blur sm:hidden">
        {items.map(([matcher, href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={cn("text-center text-[11px] font-bold", matcher.test(pathname) && "text-[#e9641a]")}
          >
            <Icon className="mx-auto" size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
