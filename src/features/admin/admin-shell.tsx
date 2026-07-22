"use client";

import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { contentText, useContent } from "@/content/client";
import { AdminNavigation } from "@/features/admin/admin-navigation";
import { getRoleLabel } from "@/features/admin/admin-role";
import { useSignOutNavigation } from "@/features/auth/use-sign-out-navigation";

export function AdminShell({
  children,
  userName,
  role,
}: {
  children: React.ReactNode;
  userName: string;
  role: string;
}) {
  const content = useContent("admin");
  const pathname = usePathname();
  const signOutFlow = useSignOutNavigation("/");
  const [menuOpen, setMenuOpen] = useState(false);
  const roleLabel = getRoleLabel(role);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div data-admin-shell className="h-[100dvh] overflow-hidden bg-[#f5f3ee] text-[#342f28]">
      <header
        data-testid="admin-header"
        className="relative z-40 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-5"
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            aria-controls="admin-mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={contentText(
              content,
              menuOpen ? "shell.closeMenu" : "shell.openMenu",
              menuOpen ? "Đóng menu quản trị" : "Mở menu quản trị",
            )}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-10 shrink-0 place-items-center rounded-full border lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <Image
              src="/assets/mascots/brand-logo-detective-head.png"
              width={40}
              height={42}
              alt="Trung tâm quản trị Suy Luận Nhí"
              className="h-10 w-auto object-contain"
            />
            <div className="min-w-0">
              <p className="truncate font-black">
                {contentText(content, "shell.cmsName", "Trung tâm quản trị")}
              </p>
              <p className="hidden truncate text-xs text-[#7d7468] sm:block">
                {contentText(content, "shell.cmsDescription", "Quản lý nhiệm vụ và nội dung")}
              </p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-right text-xs sm:block">
            <strong className="block">{userName}</strong>
            <span className="text-[#806d54]">{roleLabel}</span>
          </span>
          <button
            type="button"
            aria-label={contentText(content, "shell.logout", "Đăng xuất")}
            disabled={signOutFlow.pending}
            aria-busy={signOutFlow.pending}
            onClick={() => void signOutFlow.signOutAndNavigate()}
            className="grid size-10 place-items-center rounded-full border"
          >
            {signOutFlow.pending ? <LoaderCircle size={18} className="animate-spin" /> : <LogOut size={18} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.aside
              id="admin-mobile-navigation"
              aria-label="Điều hướng quản trị mobile"
              className="h-full w-[min(86vw,320px)] overflow-y-auto bg-white px-4 pt-20 pb-6 shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <AdminNavigation
                pathname={pathname}
                role={role}
                content={content}
                ariaLabel="Điều hướng quản trị mobile"
                onNavigate={() => setMenuOpen(false)}
              />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid h-[calc(100dvh-4rem)] min-h-0 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 scrollbar-thin overflow-y-auto overscroll-contain border-r bg-white px-3 py-4 lg:block">
          <AdminNavigation pathname={pathname} role={role} content={content} />
        </aside>
        <main
          id="admin-main-content"
          className="min-h-0 min-w-0 scrollbar-thin overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6"
        >
          <div className="mx-auto w-full max-w-[1680px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
