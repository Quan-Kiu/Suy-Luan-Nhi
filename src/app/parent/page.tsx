import { Bell } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParent } from "@/auth/session";
import { Pill } from "@/components/ui";
import { contentTemplate, contentText } from "@/content/resolve";
import { ConversationSuggestionCard } from "@/features/parent/conversation-suggestion-card";
import { DashboardMetrics } from "@/features/parent/dashboard-metrics";
import { RecentActivityCard } from "@/features/parent/recent-activity-card";
import { getContentNamespace } from "@/modules/content/content";
import { getActiveChild } from "@/modules/family/active-child";
import { getParentDashboard, getSuggestions } from "@/modules/parent/parent-data";

export default async function Page() {
  const [, content, active] = await Promise.all([
    requireParent(),
    getContentNamespace("parent"),
    getActiveChild(),
  ]);
  if (!active) redirect("/onboarding");
  const [data, suggestions] = await Promise.all([
    getParentDashboard(active.child.id, active.parent.id),
    getSuggestions(active.child.ageGroup),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="type-supporting font-medium text-[#786348]">
            {contentTemplate(content, "dashboard.greeting", "Xin chào, ba mẹ!", {
              parentName: "ba mẹ",
            })}
          </p>
          <h1 className="type-page-title mt-1.5 max-w-xl break-words">
            {contentTemplate(content, "dashboard.weekTitle", "Tuần này của {childName}", {
              childName: active.child.displayName,
            })}
          </h1>
        </div>
        <Link href="/parent/notifications">
          <Pill>
            <Bell size={16} />
            {contentTemplate(content, "dashboard.unread", "{count} chưa đọc", {
              count: data.unreadNotifications,
            })}
          </Pill>
        </Link>
      </div>
      <DashboardMetrics
        missions={data.totals.missions}
        questions={data.totals.questions}
        minutes={data.totals.minutes}
        badges={data.earnedBadges.length}
        content={content}
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <RecentActivityCard items={data.recentSessions} content={content} />
        <ConversationSuggestionCard suggestion={suggestions[0]} content={content} />
      </div>
      <h2 className="type-section-title mt-6">
        {contentText(content, "dashboard.skillsTitle", "Thói quen tư duy nổi bật")}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {data.skills.length ? (
          data.skills.map((skill) => (
            <Pill key={skill.slug}>
              {skill.title} · {skill.count}
            </Pill>
          ))
        ) : (
          <Pill>{contentText(content, "dashboard.noSkills", "Chưa có đủ dữ liệu")}</Pill>
        )}
      </div>
    </>
  );
}
