"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bell, LoaderCircle, LogOut, Menu, Play, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { contentTemplate, contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { useSignOutNavigation } from "@/features/auth/use-sign-out-navigation";

export function ParentHeader({
  childName,
  unread,
  content,
}: {
  childName: string;
  unread: number;
  content: ContentDictionary;
}) {
  const signOutFlow = useSignOutNavigation("/");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header
      data-testid="parent-header"
      className="sticky top-0 z-50 border-b border-[#eadfc9] bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
        <Link href="/parent" aria-label="Tổng quan khu vực phụ huynh">
          <Image
            src="/assets/mascots/brand-logo-detective-head.png"
            width={38}
            height={40}
            alt="Suy Luận Nhí"
            className="h-10 w-auto"
          />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-black">{contentText(content, "shell.title", "Khu vực phụ huynh")}</p>
          <p className="truncate text-xs text-[#786348]">
            {contentTemplate(content, "shell.viewing", "Đang xem: {childName}", { childName })}
          </p>
        </div>
        <Link
          href="/missions"
          prefetch={false}
          className="ml-auto hidden min-h-10 items-center gap-2 rounded-full bg-[#b9470d] px-4 text-sm font-black text-white shadow-[0_3px_0_#7f2e05] sm:inline-flex"
        >
          <Play size={17} /> Khu vực của bé
        </Link>
        <Link
          href="/profiles"
          prefetch={false}
          className="hidden rounded-full border border-[#eadfc9] px-3 py-2 text-sm font-bold sm:inline-flex"
        >
          {contentText(content, "shell.changeChild", "Đổi bé")}
        </Link>
        <button
          type="button"
          aria-controls="parent-mobile-navigation"
          aria-expanded={open}
          aria-label={contentText(
            content,
            open ? "nav.closeMenu" : "nav.openMenu",
            open ? "Đóng menu phụ huynh" : "Mở menu phụ huynh",
          )}
          onClick={() => setOpen((value) => !value)}
          className="ml-auto grid size-10 place-items-center rounded-full border border-[#eadfc9] sm:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav
            id="parent-mobile-navigation"
            aria-label="Điều hướng phụ huynh mobile"
            className="absolute inset-x-3 top-[calc(100%+0.5rem)] rounded-[22px] border border-[#eadfc9] bg-white p-3 shadow-2xl sm:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="grid gap-1">
              <Link
                href="/missions"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center gap-3 rounded-2xl bg-[#fff0df] px-4 font-black text-[#9f3d0b]"
              >
                <Play size={19} />
                Khu vực của bé
              </Link>
              <Link
                href="/profiles"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center gap-3 rounded-2xl px-4 font-black hover:bg-[#fff0df]"
              >
                <UserRound size={19} />
                {contentText(content, "shell.changeChild", "Đổi bé")}
              </Link>
              <Link
                href="/parent/notifications"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center gap-3 rounded-2xl px-4 font-black hover:bg-[#fff0df]"
              >
                <Bell size={19} />
                {contentText(content, "nav.notifications", "Thông báo")}
                {unread > 0 ? (
                  <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                    {Math.min(unread, 99)}
                  </span>
                ) : null}
              </Link>
              <button
                type="button"
                disabled={signOutFlow.pending}
                aria-busy={signOutFlow.pending}
                onClick={() => void signOutFlow.signOutAndNavigate()}
                className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left font-black text-red-700 hover:bg-red-50"
              >
                {signOutFlow.pending ? (
                  <LoaderCircle size={19} className="animate-spin" />
                ) : (
                  <LogOut size={19} />
                )}
                {signOutFlow.pending ? "Đang đăng xuất..." : contentText(content, "nav.logout", "Đăng xuất")}
              </button>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
