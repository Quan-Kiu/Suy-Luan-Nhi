import {
  Award,
  BarChart3,
  BookOpen,
  Braces,
  ClipboardCheck,
  Database,
  FileText,
  Gauge,
  House,
  ImageIcon,
  Languages,
  Layers3,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { hasPermission, type PermissionKey } from "@/auth/permissions";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    labelKey: "navGroup.primary",
    fallback: "Công việc chính",
    items: [
      {
        href: "/admin",
        labelKey: "nav.dashboard",
        fallback: "Tổng quan",
        icon: Gauge,
        permission: "admin.dashboard.view",
        exact: true,
      },
      {
        href: "/admin/parent-access",
        labelKey: "nav.parentArea",
        fallback: "Khu vực phụ huynh",
        icon: House,
        permission: "parent_access.use",
      },
      {
        href: "/admin/missions",
        labelKey: "nav.missions",
        fallback: "Nhiệm vụ",
        icon: FileText,
        permission: "missions.view",
      },
      {
        href: "/admin/reviews",
        labelKey: "nav.reviews",
        fallback: "Duyệt nội dung",
        icon: ClipboardCheck,
        permission: "missions.review",
      },
    ],
  },
  {
    labelKey: "navGroup.content",
    fallback: "Soạn nội dung",
    items: [
      {
        href: "/admin/resources",
        labelKey: "nav.resources",
        fallback: "Gợi ý cho phụ huynh",
        icon: BookOpen,
        permission: "resources.view",
      },
      {
        href: "/admin/media",
        labelKey: "nav.media",
        fallback: "Thư viện",
        icon: ImageIcon,
        permission: "media.view",
      },
      {
        href: "/admin/content",
        labelKey: "nav.content",
        fallback: "Nội dung hiển thị",
        icon: Languages,
        permission: "content.view",
      },
      {
        href: "/admin/content-variables",
        labelKey: "nav.contentVariables",
        fallback: "Từ điển",
        icon: Braces,
        permission: "content_variables.manage",
      },
      {
        href: "/admin/worlds",
        labelKey: "nav.worlds",
        fallback: "Chủ đề nhiệm vụ",
        icon: Layers3,
        permission: "worlds.manage",
      },
      {
        href: "/admin/badges",
        labelKey: "nav.badges",
        fallback: "Huy hiệu",
        icon: Award,
        permission: "badges.manage",
      },
      {
        href: "/admin/taxonomy",
        labelKey: "nav.taxonomy",
        fallback: "Nhóm tuổi & kỹ năng",
        icon: Tags,
        permission: "taxonomy.manage",
      },
    ],
  },
  {
    labelKey: "navGroup.operations",
    fallback: "Theo dõi hệ thống",
    items: [
      {
        href: "/admin/feedback",
        labelKey: "nav.feedback",
        fallback: "Góp ý hệ thống",
        icon: MessageSquareText,
        permission: "feedback.view",
      },
      {
        href: "/admin/reports",
        labelKey: "nav.reports",
        fallback: "Tình hình sử dụng",
        icon: BarChart3,
        permission: "reports.view",
      },
      {
        href: "/admin/access-control",
        labelKey: "nav.members",
        fallback: "Vai trò & thành viên",
        icon: ShieldCheck,
        permission: "access_control.view",
      },
      {
        href: "/admin/data-requests",
        labelKey: "nav.dataRequests",
        fallback: "Yêu cầu dữ liệu",
        icon: ShieldCheck,
        permission: "data_requests.manage",
      },
      {
        href: "/admin/audit",
        labelKey: "nav.audit",
        fallback: "Lịch sử thay đổi",
        icon: Database,
        permission: "audit.view",
      },
      {
        href: "/admin/settings",
        labelKey: "nav.settings",
        fallback: "Cấu hình hệ thống",
        icon: Settings,
        permission: "settings.manage",
      },
    ],
  },
] as const satisfies ReadonlyArray<{
  labelKey: string;
  fallback: string;
  items: ReadonlyArray<{
    href: string;
    labelKey: string;
    fallback: string;
    icon: typeof Gauge;
    permission: PermissionKey;
    exact?: boolean;
  }>;
}>;

type Props = {
  pathname: string;
  role?: unknown;
  permissions?: readonly PermissionKey[];
  content: ContentDictionary;
  onNavigate?: () => void;
  ariaLabel?: string;
};

export function AdminNavigation({ pathname, role, permissions, content, onNavigate, ariaLabel }: Props) {
  return (
    <nav aria-label={ariaLabel} className="space-y-4 pb-4">
      {navGroups.map((group) => {
        const visibleItems = group.items.filter((item) =>
          permissions ? permissions.includes(item.permission) : hasPermission(role, item.permission),
        );
        if (!visibleItems.length) return null;
        return (
          <section key={group.labelKey}>
            <p className="type-overline mb-1.5 px-3 text-[#756b60]">
              {contentText(content, group.labelKey, group.fallback)}
            </p>
            <div className="space-y-0.5">
              {visibleItems.map((item) => {
                const active =
                  "exact" in item && item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={item.href === "/admin/parent-access" ? false : undefined}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "type-action flex min-h-10 items-center gap-2.5 rounded-lg px-3 transition hover:bg-[#f5f2ec]",
                      active && "bg-[#fff0df] text-[#bd4910] shadow-sm",
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{contentText(content, item.labelKey, item.fallback)}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
      <details className="type-caption rounded-xl bg-[#edf4df] text-[#587048]">
        <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 px-3 py-2 font-black marker:hidden">
          <ShieldCheck size={16} />
          {contentText(content, "shell.workflowTitle", "Quy trình nội dung an toàn")}
        </summary>
        <ol className="space-y-1 border-t border-[#dbe8c9] px-3 py-2 leading-5">
          <li>1. Soạn và lưu nội dung.</li>
          <li>2. Kiểm tra an toàn cho trẻ.</li>
          <li>3. Một người khác kiểm tra trước khi cho bé xem.</li>
        </ol>
      </details>
    </nav>
  );
}
