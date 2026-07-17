import {
  BarChart3,
  ClipboardCheck,
  Database,
  FileText,
  Gauge,
  ImageIcon,
  Languages,
  Layers3,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", labelKey: "nav.dashboard", fallback: "Tổng quan", icon: Gauge, exact: true },
  { href: "/admin/missions", labelKey: "nav.missions", fallback: "Nhiệm vụ", icon: FileText },
  { href: "/admin/reviews", labelKey: "nav.reviews", fallback: "Kiểm duyệt", icon: ClipboardCheck },
  { href: "/admin/media", labelKey: "nav.media", fallback: "Media", icon: ImageIcon },
  { href: "/admin/content", labelKey: "nav.content", fallback: "Nội dung hệ thống", icon: Languages },
  { href: "/admin/worlds", labelKey: "nav.worlds", fallback: "Thế giới", icon: Layers3 },
  { href: "/admin/taxonomy", labelKey: "nav.taxonomy", fallback: "Độ tuổi & kỹ năng", icon: Tags },
  { href: "/admin/members", labelKey: "nav.members", fallback: "Thành viên", icon: Users },
  { href: "/admin/reports", labelKey: "nav.reports", fallback: "Báo cáo", icon: BarChart3 },
  {
    href: "/admin/data-requests",
    labelKey: "nav.dataRequests",
    fallback: "Data requests",
    icon: ShieldCheck,
  },
  { href: "/admin/audit", labelKey: "nav.audit", fallback: "Audit log", icon: Database },
  { href: "/admin/settings", labelKey: "nav.settings", fallback: "Cài đặt", icon: Settings },
] as const;
export function AdminNavigation({
  pathname,
  content,
  onNavigate,
  ariaLabel,
}: {
  pathname: string;
  content: ContentDictionary;
  onNavigate?: () => void;
  ariaLabel?: string;
}) {
  return (
    <nav aria-label={ariaLabel} className="space-y-1 text-sm font-bold">
      {navItems.map((item) => {
        const { href, labelKey, fallback, icon: Icon } = item;
        const exact = "exact" in item && item.exact;
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#f5f2ec]",
              active && "bg-[#fff0df] text-[#d95812]",
            )}
          >
            <Icon size={18} />
            {contentText(content, labelKey, fallback)}
          </Link>
        );
      })}
      <div className="mt-8 rounded-2xl bg-[#edf4df] p-3 text-xs text-[#587048]">
        <div className="flex items-center gap-2 font-black">
          <ShieldCheck size={16} />
          {contentText(content, "shell.workflowTitle", "Child-safe workflow")}
        </div>
        <p className="mt-1 leading-5">
          {contentText(
            content,
            "shell.workflowDescription",
            "Draft không thay đổi phiên bản đã publish. Reviewer phải duyệt trước khi xuất bản.",
          )}
        </p>
      </div>
    </nav>
  );
}
