import { Clock3, MessageCircle, Trophy } from "lucide-react";
import { Card } from "@/components/ui";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";

export function DashboardMetrics({
  missions,
  questions,
  minutes,
  badges,
  content,
}: {
  missions: number;
  questions: number;
  minutes: number;
  badges: number;
  content: ContentDictionary;
}) {
  const items = [
    [missions, contentText(content, "dashboard.metricMissions", "Nhiệm vụ"), Trophy],
    [questions, contentText(content, "dashboard.metricQuestions", "Câu hoàn thành"), MessageCircle],
    [minutes, contentText(content, "dashboard.metricMinutes", "Phút khám phá"), Clock3],
    [badges, contentText(content, "dashboard.metricBadges", "Huy hiệu"), Trophy],
  ] as const;

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-4">
      {items.map(([value, label, Icon]) => (
        <Card key={label} className="p-4 text-center">
          <Icon className="mx-auto text-[#e9641a]" />
          <p className="type-metric-value mt-2">{value}</p>
          <p className="type-caption font-bold text-[#786348]">{label}</p>
        </Card>
      ))}
    </div>
  );
}
