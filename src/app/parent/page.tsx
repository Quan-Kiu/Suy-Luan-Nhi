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
  const [session, content, active] = await Promise.all([
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[#806d54]">
            {contentTemplate(content, "dashboard.greeting", "Xin chào, {parentName}", {
              parentName: session.user.name,
            })}
          </p>
          <h1 className="text-3xl font-black">
            {contentTemplate(content, "dashboard.weekTitle", "Tuần của {childName}", {
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
      <h2 className="mt-6 text-xl font-black">
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
