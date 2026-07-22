"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, LoaderCircle, LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { contentText, useContent } from "@/content/client";
import { useSignOutNavigation } from "@/features/auth/use-sign-out-navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/missions", labelKey: "header.home", fallback: "Bản đồ nhiệm vụ", icon: ShieldCheck },
  { href: "/profiles", labelKey: "header.profiles", fallback: "Hồ sơ bé", icon: UserRound },
  { href: "/parent", labelKey: "header.parent", fallback: "Khu vực phụ huynh", icon: ShieldCheck },
] as const;

function getBackHref(pathname: string) {
  if (
    /^\/missions\/.+/.test(pathname) ||
    pathname.startsWith("/play/") ||
    pathname.startsWith("/complete/")
  ) {
    return "/missions";
  }
  if (/^\/profiles\/.+\/edit$/.test(pathname) || pathname === "/onboarding") return "/profiles";
  return null;
}

export function ChildHeader() {
  const content = useContent("child");
  const pathname = usePathname();
  const signOutFlow = useSignOutNavigation("/");
  const [open, setOpen] = useState(false);
  const backHref = getBackHref(pathname);

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
      data-testid="child-header"
      className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-[#eadfc9]/80 bg-[#fffaf0]/95 px-5 shadow-[0_6px_18px_rgba(73,52,25,0.06)] backdrop-blur"
    >
      <div className="flex min-w-0 items-center gap-1">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={contentText(content, "header.back", "Quay lại")}
            className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-[#f5ead6]"
          >
            <ArrowLeft size={20} />
          </Link>
        ) : null}
        <Link
          href="/missions"
          prefetch={true}
          className="flex min-w-0 items-center gap-2"
          aria-label="Bản đồ nhiệm vụ"
        >
          <Image
            src="/assets/mascots/brand-logo-detective-head.png"
            width={982}
            height={1035}
            alt="Linh vật thám tử của Suy Luận Nhí"
            className="h-11 w-auto shrink-0 object-contain"
          />
          <span className="type-card-title truncate text-[#3f321f]">Suy Luận Nhí</span>
        </Link>
      </div>
      <button
        type="button"
        aria-controls="child-mobile-navigation"
        aria-expanded={open}
        aria-label={contentText(
          content,
          open ? "header.closeMenu" : "header.openMenu",
          open ? "Đóng menu chế độ bé" : "Mở menu chế độ bé",
        )}
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 shrink-0 place-items-center rounded-full border border-[#eadfc9] bg-white"
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Đóng menu"
              className="fixed inset-0 top-20 z-30 bg-black/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              id="child-mobile-navigation"
              aria-label="Điều hướng chế độ bé"
              className="absolute inset-x-3 top-[calc(100%+0.75rem)] z-40 rounded-[24px] border border-[#eadfc9] bg-[#fffaf0] p-3 shadow-2xl"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="grid gap-1">
                {navigation.map(({ href, labelKey, fallback, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      prefetch={true}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "type-action flex min-h-12 items-center gap-3 rounded-2xl px-4",
                        active ? "bg-[#fff0df] text-[#bd4910]" : "hover:bg-white",
                      )}
                    >
                      <Icon size={19} />
                      {contentText(content, labelKey, fallback)}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  disabled={signOutFlow.pending}
                  aria-busy={signOutFlow.pending}
                  onClick={() => void signOutFlow.signOutAndNavigate()}
                  className="type-action flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left text-red-700 hover:bg-red-50"
                >
                  {signOutFlow.pending ? (
                    <LoaderCircle size={19} className="animate-spin" />
                  ) : (
                    <LogOut size={19} />
                  )}
                  {signOutFlow.pending
                    ? "Đang đăng xuất..."
                    : contentText(content, "header.logout", "Đăng xuất")}
                </button>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
