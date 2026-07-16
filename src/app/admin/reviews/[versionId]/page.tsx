import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminQuestionPreview } from "@/features/admin/admin-question-preview";
import { ReviewActions } from "@/features/admin/review-actions";
import { Card, Pill } from "@/components/ui";
import { db } from "@/db/client";
import { missionVersions, missions } from "@/db/schema";
import { parseMissionSnapshot } from "@/modules/catalog/snapshot";

export default async function Page({ params }: { params: Promise<{ versionId: string }> }) {
  const { versionId } = await params;
  const rows = await db
    .select({ version: missionVersions, mission: missions })
    .from(missionVersions)
    .innerJoin(missions, eq(missionVersions.missionId, missions.id))
    .where(eq(missionVersions.id, versionId))
    .limit(1);
  const result = rows[0];
  if (!result) notFound();
  const snapshot = parseMissionSnapshot(result.version.snapshot);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[#806d54]">Review version {result.version.versionNumber}</p>
          <h1 className="text-3xl font-black">{snapshot.title}</h1>
          <p className="mt-1 text-[#806d54]">{snapshot.subtitle}</p>
        </div>
        <Pill>{result.version.status}</Pill>
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-xl font-black">Tóm tắt nội dung</h2>
            <p className="mt-3 leading-7">{snapshot.storyIntro}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>{snapshot.estimatedMinutes} phút</Pill>
              <Pill>Độ khó {snapshot.difficulty}</Pill>
              <Pill>{snapshot.questions.length} câu</Pill>
              {snapshot.ageGroups.map((age) => (
                <Pill key={age}>{age} tuổi</Pill>
              ))}
            </div>
          </Card>
          {snapshot.questions.map((question, index) => (
            <Card key={question.id} className="p-4">
              <p className="mb-3 text-xs font-black text-[#806d54]">
                Câu {index + 1} · {question.type}
              </p>
              <AdminQuestionPreview question={question} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-green-50 p-3 text-sm">
                  <strong className="block text-green-800">Phản hồi đúng</strong>
                  {question.feedbackCorrect}
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-sm">
                  <strong className="block text-amber-800">Phản hồi thử lại</strong>
                  {question.feedbackIncorrect}
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-[#fff5d8] p-3 text-sm">
                <strong>Gợi ý:</strong> {question.hints.map((hint) => hint.text).join(" → ")}
              </div>
            </Card>
          ))}
        </div>
        <aside className="space-y-4">
          <Card className="sticky top-20 p-5">
            <h2 className="text-xl font-black">Safety Checklist</h2>
            <div className="mt-3 space-y-2">
              {Object.entries(snapshot.safetyChecklist).map(([key, passed]) => (
                <div
                  key={key}
                  className={`rounded-xl p-3 text-sm font-bold ${passed ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                >
                  {passed ? "✓" : "✕"} {key}
                </div>
              ))}
            </div>
            <div className="mt-5 border-t pt-5">
              <ReviewActions
                missionId={result.mission.id}
                versionId={versionId}
                status={result.version.status}
              />
              {result.version.reviewComment ? (
                <p className="mt-4 rounded-xl bg-[#f5f2ec] p-3 text-sm">
                  <strong className="block">Nhận xét đã lưu</strong>
                  {result.version.reviewComment}
                </p>
              ) : null}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
