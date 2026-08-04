import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Home, Star } from "lucide-react";
import { requireParent } from "@/auth/session";
import { Card } from "@/components/ui";
import { contentTemplate, contentText } from "@/content/resolve";
import { getContentNamespace } from "@/modules/content/content";
import { getCompletionSummary } from "@/modules/gameplay/session";
export const metadata: Metadata = {
  title: "Hoàn thành nhiệm vụ",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const auth = await requireParent();
  const { sessionId } = await params;
  const [summary, content] = await Promise.all([
    getCompletionSummary(auth.user.id, sessionId),
    getContentNamespace("child"),
  ]);
  if (!summary) notFound();
  return (
    <main className="paper-texture min-h-[calc(100svh-5rem)] px-5 pt-4 pb-8">
      <div className="relative overflow-hidden rounded-[28px]">
        <Image
          src="/assets/scenes/scene-mission-complete-celebration.png"
          width={760}
          height={760}
          preload
          alt={contentText(content, "completion.imageAlt", "Bé và Bống ăn mừng hoàn thành nhiệm vụ")}
          className="h-[390px] w-full object-cover"
        />
        <div className="absolute inset-x-3 top-3 rounded-[24px] border-4 border-[#8d6031] bg-[#f2d28c]/95 p-4 text-center">
          <p className="type-overline font-black tracking-[.2em] text-[#50733c] uppercase">
            {contentText(content, "completion.label", "Nhiệm vụ hoàn thành")}
          </p>
          <h1 className="type-child-page-title">{contentText(content, "completion.title", "Tuyệt vời!")}</h1>
          <p className="font-black">{summary.mission.title}</p>
        </div>
      </div>
      {summary.badge ? (
        <Card className="relative mx-3 -mt-6 flex items-center gap-4 p-4">
          <Image
            src={summary.badge.iconUrl}
            width={96}
            height={96}
            alt={contentTemplate(content, "completion.badgeAlt", "Huy hiệu {badgeName}", {
              badgeName: summary.badge.name,
            })}
            className="size-24 object-contain"
          />
          <div>
            <p className="type-overline font-black tracking-wider text-[#b77b20] uppercase">
              {contentText(content, "completion.newBadge", "Huy hiệu mới")}
            </p>
            <h2 className="type-child-section-title">{summary.badge.name}</h2>
            <p className="type-supporting text-[#76634b]">{summary.badge.description}</p>
          </div>
        </Card>
      ) : null}
      <div className="mt-5 flex justify-center gap-2">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={star <= summary.session.stars ? "fill-[#f5b557] text-[#d89018]" : "text-[#d7c9b2]"}
            size={36}
          />
        ))}
      </div>
      <h2 className="type-child-section-title mt-5 text-center">
        {contentText(content, "completion.habitsTitle", "Con đã luyện những thói quen nào?")}
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {summary.thinkingHabits.map((habit) => (
          <div key={habit.slug} className="rounded-2xl border border-[#eadfc9] bg-white p-3 text-center">
            <CheckCircle2 className="mx-auto text-[#658e4e]" />
            <p className="type-label mt-2 font-black">{habit.title}</p>
          </div>
        ))}
      </div>
      <Card className="mt-5 bg-[#fff3d5] p-4 text-center">
        <p className="font-bold">
          {contentText(
            content,
            "completion.encouragement",
            "Mỗi lần nhìn kỹ và thử lại là một lần bộ não khỏe hơn một chút!",
          )}
        </p>
      </Card>
      <Link
        href="/missions"
        prefetch={true}
        className="wood-button mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl font-black text-white"
      >
        <Home size={20} />
        {contentText(content, "completion.backToMap", "Về bản đồ nhiệm vụ")}
      </Link>
    </main>
  );
}
