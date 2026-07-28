"use client";

import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { contentText, useContent } from "@/content/client";
import { AdminNavigation } from "@/features/admin/admin-navigation";
import { useSignOutNavigation } from "@/features/auth/use-sign-out-navigation";

export function AdminShell({
  children,
  userName,
  role,
  roleLabel,
  permissions,
}: {
  children: React.ReactNode;
  userName: string;
  role: string;
  roleLabel?: string;
  permissions?: readonly import("@/auth/permissions").PermissionKey[];
}) {
  const content = useContent("admin");
  const pathname = usePathname();
  const signOutFlow = useSignOutNavigation("/");
  const [menuOpen, setMenuOpen] = useState(false);
  const displayedRoleLabel = roleLabel ?? role;

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      root.style.overflow = previousRootOverflow;
      root.style.overscrollBehavior = previousRootOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, []);

  return (
    <div
      data-admin-shell
      className="grid h-screen w-full max-w-full grid-rows-[calc(4rem+var(--safe-area-top))_minmax(0,1fr)] overflow-hidden bg-[#f5f3ee] text-[#342f28]"
      style={{ height: "100dvh" }}
    >
      <header
        data-testid="admin-header"
        className="safe-area-header relative z-40 flex min-h-[calc(4rem+var(--safe-area-top))] items-center justify-between border-b bg-white px-4 sm:px-5"
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
            className="grid size-10 shrink-0 place-items-center rounded-full border xl:hidden"
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
              <p className="type-card-title truncate">
                {contentText(content, "shell.cmsName", "Trung tâm quản trị")}
              </p>
              <p className="type-caption hidden truncate text-[#7d7468] sm:block">
                {contentText(content, "shell.cmsDescription", "Quản lý nhiệm vụ và nội dung")}
              </p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="type-caption hidden text-right sm:block">
            <strong className="block">{userName}</strong>
            <span className="text-[#806d54]">{displayedRoleLabel}</span>
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
            className="fixed inset-0 z-30 bg-black/30 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.aside
              id="admin-mobile-navigation"
              aria-label="Điều hướng quản trị mobile"
              className="h-full w-[min(86vw,320px)] overflow-y-auto bg-white px-4 pt-[calc(5rem+var(--safe-area-top))] pb-[max(1.5rem,var(--safe-area-bottom))] shadow-2xl [-webkit-overflow-scrolling:touch]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <AdminNavigation
                pathname={pathname}
                role={role}
                permissions={permissions}
                content={content}
                ariaLabel="Điều hướng quản trị mobile"
                onNavigate={() => setMenuOpen(false)}
              />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid min-h-0 min-w-0 xl:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 min-w-0 scrollbar-thin overflow-x-hidden overflow-y-auto overscroll-contain border-r bg-white px-3 py-4 xl:block">
          <AdminNavigation pathname={pathname} role={role} permissions={permissions} content={content} />
        </aside>
        <main
          id="admin-main-content"
          tabIndex={0}
          aria-label={contentText(content, "shell.mainContent", "Nội dung quản trị")}
          className="min-h-0 min-w-0 scrollbar-thin overflow-x-hidden overflow-y-auto overscroll-contain p-4 pb-[max(1rem,var(--safe-area-bottom))] outline-none focus-visible:ring-2 focus-visible:ring-[#d86a24] focus-visible:ring-inset sm:p-5 lg:p-6"
        >
          <div className="mx-auto h-full min-h-0 w-full max-w-[1680px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
