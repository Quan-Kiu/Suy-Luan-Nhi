import { eq } from "drizzle-orm";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRoles } from "@/auth/session";
import { friendlyLabel, questionTypeLabels, safetyChecklistLabels } from "@/features/admin/admin-labels";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { AdminQuestionPreview } from "@/features/admin/admin-question-preview";
import { MissionStatusBadge } from "@/features/admin/mission-status-badge";
import { ReviewActions } from "@/features/admin/review-actions";
import { Card, Pill } from "@/components/ui";
import { db } from "@/db/client";
import { missionVersions, missions } from "@/db/schema";
import { parseMissionSnapshot } from "@/modules/catalog/snapshot";

export default async function Page({ params }: { params: Promise<{ versionId: string }> }) {
  await requireRoles(["reviewer", "super_admin"]);
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
    <div className="space-y-6">
      <Link
        href="/admin/reviews"
        className="type-action inline-flex items-center gap-2 font-black text-[#6f6558]"
      >
        <ArrowLeft size={17} /> Quay lại danh sách chờ duyệt
      </Link>
      <AdminPageHeader
        eyebrow={`Kiểm duyệt · Lần gửi ${result.version.versionNumber}`}
        title={snapshot.title}
        description={`${snapshot.subtitle}. Xem lần lượt phần giới thiệu, từng câu hỏi và kiểm tra an toàn trước khi quyết định.`}
        icon={ClipboardCheck}
        actions={<MissionStatusBadge status={result.version.status} />}
      />
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="type-section-title">Tóm tắt nội dung</h2>
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
              <p className="type-caption mb-3 font-black text-[#806d54]">
                Câu {index + 1} · {friendlyLabel(questionTypeLabels, question.type)}
              </p>
              <AdminQuestionPreview question={question} />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="type-supporting rounded-xl bg-green-50 p-3">
                  <strong className="block text-green-800">Lời khen khi bé trả lời đúng</strong>
                  {question.feedbackCorrect}
                </div>
                <div className="type-supporting rounded-xl bg-amber-50 p-3">
                  <strong className="block text-amber-800">Lời nhắc khi bé chưa trả lời đúng</strong>
                  {question.feedbackIncorrect}
                </div>
              </div>
              <div className="type-supporting mt-3 rounded-xl bg-[#fff5d8] p-3">
                <strong>Gợi ý:</strong> {question.hints.map((hint) => hint.text).join(" → ")}
              </div>
            </Card>
          ))}
        </div>
        <aside className="space-y-4">
          <Card className="sticky top-20 p-5">
            <h2 className="type-section-title">Kiểm tra trước khi xác nhận</h2>
            <p className="type-supporting mt-1 text-[#6f6558]">
              Các mục bên dưới do người soạn tự xác nhận. Hãy đối chiếu lại với nội dung đang xem.
            </p>
            <div className="mt-3 space-y-2">
              {Object.entries(snapshot.safetyChecklist).map(([key, passed]) => (
                <div
                  key={key}
                  className={`type-supporting rounded-xl p-3 font-bold ${passed ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                >
                  {passed ? "✓" : "✕"} {friendlyLabel(safetyChecklistLabels, key)}
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
                <p className="type-supporting mt-4 rounded-xl bg-[#f5f2ec] p-3">
                  <strong className="block">Lời nhắn đã lưu</strong>
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
