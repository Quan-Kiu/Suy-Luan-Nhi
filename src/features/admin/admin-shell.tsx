"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  Languages,
  Database,
  FileText,
  Gauge,
  ImageIcon,
  Layers3,
  LogOut,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { signOut } from "@/auth/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: Gauge, exact: true },
  { href: "/admin/missions", label: "Nhiệm vụ", icon: FileText },
  { href: "/admin/reviews", label: "Kiểm duyệt", icon: ClipboardCheck },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/content", label: "Nội dung hệ thống", icon: Languages },
  { href: "/admin/worlds", label: "Thế giới", icon: Layers3 },
  { href: "/admin/taxonomy", label: "Độ tuổi & kỹ năng", icon: Tags },
  { href: "/admin/members", label: "Thành viên", icon: Users },
  { href: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/admin/data-requests", label: "Data requests", icon: ShieldCheck },
  { href: "/admin/audit", label: "Audit log", icon: Database },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
] as const;

export function AdminShell({
  children,
  userName,
  role,
}: {
  children: React.ReactNode;
  userName: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#342f28]">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-5">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/assets/mascots/brand-logo-detective-head.png"
            width={40}
            height={42}
            alt="Suy Luận Nhí CMS"
            className="h-10 w-auto object-contain"
          />
          <div>
            <p className="font-black">Suy Luận Nhí CMS</p>
            <p className="text-xs text-[#7d7468]">Quản trị nội dung an toàn</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-right text-xs sm:block">
            <strong className="block">{userName}</strong>
            <span className="text-[#806d54]">{role}</span>
          </span>
          <button
            type="button"
            aria-label="Đăng xuất"
            onClick={async () => {
              await signOut();
              router.push("/");
              router.refresh();
            }}
            className="grid size-10 place-items-center rounded-full border"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden border-r bg-white p-4 lg:block">
          <nav className="sticky top-20 space-y-1 text-sm font-bold">
            {navItems.map((item) => {
              const { href, label, icon: Icon } = item;
              const exact = "exact" in item && item.exact;
              const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#f5f2ec]",
                    active && "bg-[#fff0df] text-[#d95812]",
                  )}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
            <div className="mt-8 rounded-2xl bg-[#edf4df] p-3 text-xs text-[#587048]">
              <div className="flex items-center gap-2 font-black">
                <ShieldCheck size={16} /> Child-safe workflow
              </div>
              <p className="mt-1 leading-5">
                Draft không thay đổi phiên bản đã publish. Reviewer phải duyệt trước khi xuất bản.
              </p>
            </div>
          </nav>
        </aside>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
