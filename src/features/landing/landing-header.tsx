"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { assets } from "@/domain/content";
import { AuthAwareEntryLink } from "@/features/landing/auth-aware-entry-link";

function NavigationLinks({
  content,
  onNavigate,
  mobile = false,
}: {
  content: ContentDictionary;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const className = mobile ? "rounded-xl px-4 py-3 font-black hover:bg-[#fff0df]" : undefined;
  return (
    <>
      <a href="#how" onClick={onNavigate} className={className}>
        {contentText(content, "header.how", "Bé bắt đầu ra sao?")}
      </a>
      <a href="#safe" onClick={onNavigate} className={className}>
        {contentText(content, "header.safe", "An toàn cho bé")}
      </a>
      <AuthAwareEntryLink
        content={content}
        compact
        onNavigate={onNavigate}
        className={mobile ? "rounded-xl px-4 py-3" : undefined}
      />
    </>
  );
}

export function LandingHeader({ content }: { content: ContentDictionary }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const openLabel = contentText(content, "header.openMenu", "Mở menu điều hướng");
  const closeLabel = contentText(content, "header.closeMenu", "Đóng menu điều hướng");
  return (
    <header className="relative z-40 border-b border-transparent bg-[#fffaf0]/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
        <Link href="/" aria-label="Trang chủ Suy Luận Nhí">
          <Image
            src={assets.logo}
            width={190}
            height={66}
            loading="eager"
            alt="Suy Luận Nhí"
            className="h-14 w-auto object-contain"
          />
        </Link>
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-7 text-sm font-black md:flex">
          <NavigationLinks content={content} />
        </nav>
        <button
          type="button"
          aria-label={open ? closeLabel : openLabel}
          aria-expanded={open}
          aria-controls="landing-mobile-nav"
          onClick={() => setOpen((value) => !value)}
          className="grid size-11 place-items-center rounded-full border border-[#e4d5ba] bg-white md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav
            id="landing-mobile-nav"
            aria-label="Điều hướng mobile"
            className="absolute inset-x-0 top-full border-y border-[#eadfc9] bg-[#fffaf0] p-4 shadow-xl md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="mx-auto grid max-w-7xl gap-2">
              <NavigationLinks content={content} mobile onNavigate={() => setOpen(false)} />
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
