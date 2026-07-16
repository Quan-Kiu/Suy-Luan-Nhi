"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Save, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminQuestionPreview } from "@/features/admin/admin-question-preview";
import { Button, Card, Pill } from "@/components/ui";
import type { AdminMissionDraft } from "@/modules/admin/schemas";
import type { PlayableQuestion } from "@/modules/gameplay/question";
import { requestJson } from "@/lib/http";

type Taxonomy = {
  worlds: Array<{ id: string; title: string }>;
  skills: Array<{ id: string; title: string; slug: string }>;
  badges: Array<{ id: string; name: string; iconUrl: string }>;
};
type DraftQuestion = AdminMissionDraft["questions"][number];

const inputClass =
  "min-h-11 w-full rounded-xl border border-[#ddd7ca] bg-white px-3 text-sm focus:border-[#e9641a]";
const safetyLabels: Record<keyof AdminMissionDraft["safety"], string> = {
  ageAppropriate: "Độ tuổi phù hợp",
  hintsSupportive: "Gợi ý mang tính hỗ trợ",
  feedbackPositive: "Phản hồi tích cực",
  noProhibitedClaims: "Không có tuyên bố bị cấm",
  noExternalLinks: "Không có liên kết ngoài",
  languageAndImagesSafe: "Ngôn ngữ và hình ảnh an toàn",
};
const typeLabels: Record<DraftQuestion["type"], string> = {
  single_choice: "Chọn một đáp án",
  pattern_sequence: "Chuỗi quy luật",
  drag_drop: "Kéo/thả vào vị trí",
  fill_answer: "Điền đáp án",
  sorting: "Sắp xếp thứ tự",
};

function defaultQuestion(type: DraftQuestion["type"], order: number): DraftQuestion {
  const common = {
    order,
    prompt: "Câu hỏi mới",
    instruction: "Hãy quan sát và trả lời nhé!",
    difficulty: 1,
    feedbackCorrect: "Tuyệt vời! Con đã tìm ra manh mối.",
    feedbackIncorrect: "Chưa trúng thôi! Con thử nhìn lại nhé.",
    hints: [{ level: 1, text: "Con thử nhìn từng phần một nhé." }],
  };
  switch (type) {
    case "single_choice":
      return {
        ...common,
        type,
        payload: {
          options: [
            { id: "a", label: "Đáp án A" },
            { id: "b", label: "Đáp án B" },
          ],
        },
        correctAnswer: "a",
      };
    case "pattern_sequence":
      return {
        ...common,
        type,
        payload: {
          sequence: [
            { id: "item-1", label: "Mảnh 1" },
            { id: "item-2", label: "Mảnh 2" },
            { id: "missing", label: "Ô trống", missing: true },
          ],
          options: [
            { id: "a", label: "Đáp án A" },
            { id: "b", label: "Đáp án B" },
          ],
        },
        correctAnswer: "a",
      };
    case "drag_drop":
      return {
        ...common,
        type,
        payload: {
          items: [
            { id: "item-1", label: "Mảnh 1" },
            { id: "item-2", label: "Mảnh 2" },
          ],
          slots: [
            { id: "slot-1", label: "Vị trí 1" },
            { id: "slot-2", label: "Vị trí 2" },
          ],
        },
        correctAnswer: { "slot-1": "item-1", "slot-2": "item-2" },
      };
    case "fill_answer":
      return {
        ...common,
        type,
        payload: { placeholder: "Nhập đáp án", inputMode: "text" },
        correctAnswer: ["đáp án"],
      };
    case "sorting":
      return {
        ...common,
        type,
        payload: {
          items: [
            { id: "first", label: "Bước 1" },
            { id: "second", label: "Bước 2" },
          ],
        },
        correctAnswer: ["first", "second"],
      };
  }
}

function QuestionCardEditor({
  question,
  index,
  total,
  active,
  onActivate,
  onChange,
  onMove,
  onRemove,
}: {
  question: DraftQuestion;
  index: number;
  total: number;
  active: boolean;
  onActivate: () => void;
  onChange: (question: DraftQuestion) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [payloadText, setPayloadText] = useState(() => JSON.stringify(question.payload, null, 2));
  const [answerText, setAnswerText] = useState(() => JSON.stringify(question.correctAnswer, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  function parseJson(field: "payload" | "correctAnswer", value: string) {
    try {
      const parsed = JSON.parse(value) as unknown;
      setJsonError(null);
      onChange({ ...question, [field]: parsed } as DraftQuestion);
    } catch {
      setJsonError("JSON chưa hợp lệ. Hãy kiểm tra dấu ngoặc và dấu phẩy.");
    }
  }

  return (
    <Card className={`rounded-2xl p-4 shadow-sm ${active ? "ring-2 ring-[#e9641a]" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onActivate} className="mr-auto text-left">
          <p className="text-xs font-bold text-[#806d54]">Câu {index + 1}</p>
          <h3 className="font-black">{typeLabels[question.type]}</h3>
        </button>
        <button
          type="button"
          aria-label="Đưa câu hỏi lên"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          className="rounded-lg border p-2 disabled:opacity-30"
        >
          <ArrowUp size={16} />
        </button>
        <button
          type="button"
          aria-label="Đưa câu hỏi xuống"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          className="rounded-lg border p-2 disabled:opacity-30"
        >
          <ArrowDown size={16} />
        </button>
        <button
          type="button"
          aria-label="Xóa câu hỏi"
          disabled={total === 1}
          onClick={onRemove}
          className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 disabled:opacity-30"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold">
          Loại câu hỏi
          <select
            className={inputClass}
            value={question.type}
            onChange={(event) =>
              onChange(defaultQuestion(event.target.value as DraftQuestion["type"], index + 1))
            }
          >
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold">
          Độ khó
          <select
            className={inputClass}
            value={question.difficulty}
            onChange={(event) =>
              onChange({ ...question, difficulty: Number(event.target.value) } as DraftQuestion)
            }
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                Mức {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold md:col-span-2">
          Câu hỏi
          <input
            className={inputClass}
            placeholder="Ví dụ: Hình nào xuất hiện tiếp theo?"
            value={question.prompt}
            onChange={(event) => onChange({ ...question, prompt: event.target.value } as DraftQuestion)}
          />
        </label>
        <label className="text-sm font-bold md:col-span-2">
          Hướng dẫn
          <input
            className={inputClass}
            placeholder="Hướng dẫn ngắn, rõ và phù hợp độ tuổi"
            value={question.instruction}
            onChange={(event) => onChange({ ...question, instruction: event.target.value } as DraftQuestion)}
          />
        </label>
        <label className="text-sm font-bold md:col-span-2">
          Payload JSON
          <textarea
            rows={8}
            className={`${inputClass} py-3 font-mono text-xs`}
            placeholder='{"options":[{"id":"a","label":"Lựa chọn A"}]}'
            value={payloadText}
            onChange={(event) => {
              setPayloadText(event.target.value);
              parseJson("payload", event.target.value);
            }}
          />
        </label>
        <label className="text-sm font-bold md:col-span-2">
          Đáp án đúng JSON
          <textarea
            rows={4}
            className={`${inputClass} py-3 font-mono text-xs`}
            placeholder='"a" hoặc ["a","b"]'
            value={answerText}
            onChange={(event) => {
              setAnswerText(event.target.value);
              parseJson("correctAnswer", event.target.value);
            }}
          />
        </label>
        {jsonError ? <p className="text-sm font-bold text-red-700 md:col-span-2">{jsonError}</p> : null}
        <label className="text-sm font-bold md:col-span-2">
          Gợi ý, mỗi dòng là một cấp
          <textarea
            rows={4}
            className={`${inputClass} py-3`}
            placeholder="Mỗi dòng là một gợi ý, tối đa 3 dòng"
            value={question.hints.map((hint) => hint.text).join("\n")}
            onChange={(event) =>
              onChange({
                ...question,
                hints: event.target.value
                  .split("\n")
                  .filter(Boolean)
                  .slice(0, 3)
                  .map((text, hintIndex) => ({ level: hintIndex + 1, text })),
              } as DraftQuestion)
            }
          />
        </label>
        <label className="text-sm font-bold">
          Phản hồi đúng
          <textarea
            rows={3}
            className={`${inputClass} py-2`}
            placeholder="Phản hồi tích cực khi bé trả lời đúng"
            value={question.feedbackCorrect}
            onChange={(event) =>
              onChange({ ...question, feedbackCorrect: event.target.value } as DraftQuestion)
            }
          />
        </label>
        <label className="text-sm font-bold">
          Phản hồi chưa đúng
          <textarea
            rows={3}
            className={`${inputClass} py-2`}
            placeholder="Khuyến khích bé thử lại, không tạo áp lực"
            value={question.feedbackIncorrect}
            onChange={(event) =>
              onChange({ ...question, feedbackIncorrect: event.target.value } as DraftQuestion)
            }
          />
        </label>
      </div>
    </Card>
  );
}

export function ProductionMissionEditor({
  initial,
  taxonomy,
  missionId,
  status = "draft",
}: {
  initial: AdminMissionDraft;
  taxonomy: Taxonomy;
  missionId?: string;
  status?: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [pending, setPending] = useState<"save" | "submit" | null>(null);
  const allSafe = Object.values(draft.safety).every(Boolean);
  const previewQuestion = useMemo(() => {
    const question = draft.questions[Math.min(activeQuestion, draft.questions.length - 1)];
    return { ...question, id: question.id ?? "550e8400-e29b-41d4-a716-446655440000" } as PlayableQuestion;
  }, [activeQuestion, draft.questions]);

  function updateQuestion(index: number, question: DraftQuestion) {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((entry, entryIndex) =>
        entryIndex === index ? { ...question, order: index + 1 } : entry,
      ),
    }));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.questions.length) return;
    setDraft((current) => {
      const questions = [...current.questions];
      [questions[index], questions[target]] = [questions[target], questions[index]];
      return {
        ...current,
        questions: questions.map((question, questionIndex) => ({ ...question, order: questionIndex + 1 })),
      };
    });
    setActiveQuestion(target);
  }

  async function persist() {
    setPending("save");
    try {
      const result = await requestJson<{ id: string }>(
        missionId ? `/api/admin/missions/${missionId}` : "/api/admin/missions",
        { method: missionId ? "PATCH" : "POST", body: JSON.stringify(draft) },
      );
      toast.success("Đã lưu bản nháp vào PostgreSQL");
      if (!missionId) {
        router.push(`/admin/missions/${result.id}/edit`);
        router.refresh();
      }
      return result.id;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu nhiệm vụ");
      return null;
    } finally {
      setPending(null);
    }
  }

  async function submitReview() {
    setPending("submit");
    const savedId = await persist();
    const targetId = missionId ?? savedId;
    if (!targetId) return;
    try {
      await requestJson(`/api/admin/missions/${targetId}/submit`, { method: "POST" });
      toast.success("Đã tạo phiên bản bất biến và gửi reviewer");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi duyệt");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
      <div className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#8a8176]">
              Mission CMS · {missionId ? "Chỉnh sửa" : "Tạo mới"}
            </p>
            <h1 className="text-3xl font-black">{draft.title || "Nhiệm vụ mới"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Pill>{status}</Pill>
            <Button
              type="button"
              onClick={persist}
              disabled={Boolean(pending)}
              className="min-h-10 rounded-xl px-4 py-2 text-sm shadow-[0_4px_0_#bd4910]"
            >
              <Save size={16} className="mr-2 inline" />
              {pending === "save" ? "Đang lưu..." : "Lưu draft"}
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl p-5 shadow-sm">
          <h2 className="text-xl font-black">1. Thông tin cơ bản</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold">
              Tiêu đề
              <input
                className={inputClass}
                placeholder="Ví dụ: Thám tử dấu chân"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
            </label>
            <label className="text-sm font-bold">
              Slug
              <input
                className={inputClass}
                placeholder="tham-tu-dau-chan"
                value={draft.slug}
                onChange={(event) =>
                  setDraft({ ...draft, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                }
              />
            </label>
            <label className="text-sm font-bold md:col-span-2">
              Phụ đề
              <input
                className={inputClass}
                placeholder="Một câu phụ đề ngắn gọn"
                value={draft.subtitle}
                onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })}
              />
            </label>
            <label className="text-sm font-bold md:col-span-2">
              Mô tả ngắn
              <input
                className={inputClass}
                placeholder="Mô tả ngắn hiển thị trên thẻ nhiệm vụ"
                value={draft.shortDescription}
                onChange={(event) => setDraft({ ...draft, shortDescription: event.target.value })}
              />
            </label>
            <label className="text-sm font-bold md:col-span-2">
              Câu chuyện dẫn dắt
              <textarea
                rows={5}
                className={`${inputClass} py-3`}
                placeholder="Câu chuyện dẫn dắt bé vào nhiệm vụ..."
                value={draft.storyIntro}
                onChange={(event) => setDraft({ ...draft, storyIntro: event.target.value })}
              />
            </label>
            <label className="text-sm font-bold">
              Thế giới
              <select
                className={inputClass}
                value={draft.worldId}
                onChange={(event) => setDraft({ ...draft, worldId: event.target.value })}
              >
                {taxonomy.worlds.map((world) => (
                  <option key={world.id} value={world.id}>
                    {world.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold">
              Kỹ năng chính
              <select
                className={inputClass}
                value={draft.primarySkillId}
                onChange={(event) => setDraft({ ...draft, primarySkillId: event.target.value })}
              >
                {taxonomy.skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold">
              Phần thưởng
              <select
                className={inputClass}
                value={draft.rewardBadgeId ?? ""}
                onChange={(event) => setDraft({ ...draft, rewardBadgeId: event.target.value || null })}
              >
                <option value="">Không có huy hiệu</option>
                {taxonomy.badges.map((badge) => (
                  <option key={badge.id} value={badge.id}>
                    {badge.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold">
              Thời gian (phút)
              <input
                type="number"
                min={1}
                max={30}
                className={inputClass}
                value={draft.estimatedMinutes}
                onChange={(event) => setDraft({ ...draft, estimatedMinutes: Number(event.target.value) })}
              />
            </label>
            <label className="text-sm font-bold">
              Độ khó
              <select
                className={inputClass}
                value={draft.difficulty}
                onChange={(event) => setDraft({ ...draft, difficulty: Number(event.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    Mức {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold md:col-span-2">
              Ảnh bìa URL
              <input
                className={inputClass}
                placeholder="/assets/cards/mission-cover.png"
                value={draft.coverUrl}
                onChange={(event) => setDraft({ ...draft, coverUrl: event.target.value })}
              />
            </label>
          </div>
          <div className="mt-4">
            <p className="text-sm font-black">Nhóm tuổi</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {(["2-3", "4-5", "6-8"] as const).map((ageGroup) => (
                <label
                  key={ageGroup}
                  className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 font-bold"
                >
                  <input
                    type="checkbox"
                    checked={draft.ageGroups.includes(ageGroup)}
                    onChange={() =>
                      setDraft({
                        ...draft,
                        ageGroups: draft.ageGroups.includes(ageGroup)
                          ? draft.ageGroups.filter((item) => item !== ageGroup)
                          : [...draft.ageGroups, ageGroup],
                      })
                    }
                  />
                  {ageGroup} tuổi
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-black">Kỹ năng phụ</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {taxonomy.skills.map((skill) => (
                <label
                  key={skill.id}
                  className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-bold"
                >
                  <input
                    type="checkbox"
                    checked={draft.secondarySkillIds.includes(skill.id)}
                    onChange={() =>
                      setDraft({
                        ...draft,
                        secondarySkillIds: draft.secondarySkillIds.includes(skill.id)
                          ? draft.secondarySkillIds.filter((id) => id !== skill.id)
                          : [...draft.secondarySkillIds, skill.id],
                      })
                    }
                  />
                  {skill.title}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 font-bold">
              <input
                type="checkbox"
                checked={draft.allowReplay}
                onChange={(event) => setDraft({ ...draft, allowReplay: event.target.checked })}
              />
              Cho phép chơi lại
            </label>
            <label className="flex items-center gap-2 font-bold">
              <input
                type="checkbox"
                checked={draft.randomizeAnswers}
                onChange={(event) => setDraft({ ...draft, randomizeAnswers: event.target.checked })}
              />
              Đảo đáp án khi chơi
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">2. Câu hỏi ({draft.questions.length})</h2>
          <button
            type="button"
            onClick={() => {
              setDraft({
                ...draft,
                questions: [...draft.questions, defaultQuestion("single_choice", draft.questions.length + 1)],
              });
              setActiveQuestion(draft.questions.length);
            }}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 font-black"
          >
            <Plus size={17} />
            Thêm câu hỏi
          </button>
        </div>
        {draft.questions.map((question, index) => (
          <QuestionCardEditor
            key={`${question.id ?? index}-${question.type}`}
            question={question}
            index={index}
            total={draft.questions.length}
            active={index === activeQuestion}
            onActivate={() => setActiveQuestion(index)}
            onChange={(next) => updateQuestion(index, next)}
            onMove={(direction) => moveQuestion(index, direction)}
            onRemove={() => {
              setDraft({
                ...draft,
                questions: draft.questions
                  .filter((_, questionIndex) => questionIndex !== index)
                  .map((entry, questionIndex) => ({ ...entry, order: questionIndex + 1 })),
              });
              setActiveQuestion(Math.max(0, index - 1));
            }}
          />
        ))}

        <Card className="rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">3. Safety Checklist</h2>
            <Pill className={allSafe ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}>
              {allSafe ? "Đạt 100%" : "Chưa hoàn tất"}
            </Pill>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(Object.keys(safetyLabels) as Array<keyof AdminMissionDraft["safety"]>).map((key) => (
              <label key={key} className="flex items-center gap-3 rounded-xl border bg-white p-3 font-bold">
                <input
                  type="checkbox"
                  className="size-5 accent-[#5f8d49]"
                  checked={draft.safety[key]}
                  onChange={(event) =>
                    setDraft({ ...draft, safety: { ...draft.safety, [key]: event.target.checked } })
                  }
                />
                {safetyLabels[key]}
              </label>
            ))}
          </div>
        </Card>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={persist} disabled={Boolean(pending)}>
            <Save size={18} className="mr-2 inline" />
            Lưu bản nháp
          </Button>
          <button
            type="button"
            onClick={submitReview}
            disabled={Boolean(pending) || !allSafe}
            className="min-h-12 rounded-2xl bg-[#5d8c48] px-5 font-black text-white disabled:opacity-40"
          >
            <Send size={18} className="mr-2 inline" />
            {pending === "submit" ? "Đang gửi..." : "Lưu và gửi duyệt"}
          </button>
        </div>
      </div>

      <aside className="min-w-0">
        <div className="sticky top-20 space-y-4">
          <Card className="overflow-hidden rounded-[30px] p-3 shadow-xl">
            <div className="relative mb-3 h-32 overflow-hidden rounded-[22px]">
              <Image
                src={draft.coverUrl || "/assets/cards/mission-thumb-footprint-detective.png"}
                fill
                alt="Preview ảnh bìa"
                className="object-cover"
              />
            </div>
            <AdminQuestionPreview
              key={`${previewQuestion.id}-${activeQuestion}`}
              question={previewQuestion}
            />
          </Card>
          <Card className="p-4">
            <p className="font-black">Quy tắc xuất bản</p>
            <ul className="mt-2 space-y-2 text-sm text-[#746b60]">
              <li>✓ Draft không ghi đè phiên bản đang publish.</li>
              <li>✓ Submit tạo snapshot bất biến.</li>
              <li>✓ Reviewer duyệt hoặc trả lại với nhận xét.</li>
              <li>✓ Chỉ phiên bản approved mới được publish.</li>
            </ul>
          </Card>
        </div>
      </aside>
    </div>
  );
}
