"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BarChart3, BookOpen, Home, Lightbulb, LockKeyhole, Settings } from "lucide-react";
import { BrandHeader } from "@/components/brand-header";
import { Button, Card, Pill } from "@/components/ui";
import { assets, footprintMission } from "@/domain/content";
import { parentUnlockSchema, type ParentUnlockInput } from "@/domain/schemas";
import { requestJson } from "@/lib/http";
import { useChildProfile } from "@/lib/use-child-profile";
import { useCompletedMissionIds } from "@/lib/use-mission-progress";

const parentTabs = [
  { label: "Tổng quan", icon: Home, active: true },
  { label: "Hoạt động", icon: BarChart3 },
  { label: "Gợi ý", icon: Lightbulb },
  { label: "Tài nguyên", icon: BookOpen },
  { label: "Cài đặt", icon: Settings },
];

export function ParentExperience() {
  const [unlocked, setUnlocked] = useState(false);
  const profile = useChildProfile();
  const completedMissionIds = useCompletedMissionIds();
  const form = useForm<ParentUnlockInput>({
    resolver: zodResolver(parentUnlockSchema),
    defaultValues: { answer: "" },
  });
  const mutation = useMutation({
    mutationFn: (input: ParentUnlockInput) =>
      requestJson<{ ok: true }>("/api/parent/unlock", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => setUnlocked(true),
    onError: (error) => form.setError("answer", { message: error.message }),
  });

  if (!unlocked) {
    return (
      <>
        <BrandHeader backHref="/profiles" />
        <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 py-8">
          <div className="text-center">
            <Image
              src={assets.privacy}
              width={128}
              height={128}
              alt="Khóa khu vực phụ huynh"
              className="mx-auto h-28 w-28 object-contain"
            />
            <h1 className="mt-2 text-3xl font-black">Khu vực phụ huynh</h1>
            <p className="mt-2 text-[#806d54]">Một bước nhỏ để giữ thông tin của gia đình an toàn.</p>
          </div>
          <Card className="mt-7 p-5">
            <div className="flex items-center gap-3">
              <LockKeyhole className="text-[#6b8d4a]" />
              <p className="font-black">Ba/mẹ trả lời giúp Bống nhé</p>
            </div>
            <p className="mt-4 text-center text-2xl font-black">17 + 6 = ?</p>
            <form
              className="mt-4 space-y-3"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              <input
                inputMode="numeric"
                aria-label="Kết quả phép tính"
                className="min-h-14 w-full rounded-2xl border-2 border-[#eadfc9] bg-white px-4 text-center text-xl"
                {...form.register("answer")}
              />
              {form.formState.errors.answer ? (
                <p className="text-center text-sm font-bold text-red-700">
                  {form.formState.errors.answer.message}
                </p>
              ) : null}
              <Button className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Đang kiểm tra..." : "Mở khu vực phụ huynh"}
              </Button>
            </form>
          </Card>
        </main>
      </>
    );
  }

  const childName = profile?.displayName ?? "Bống";
  const completedMissionCount = completedMissionIds.length;
  const completedQuestionCount = completedMissionIds.includes(footprintMission.id)
    ? footprintMission.questions.length
    : 0;
  const thinkingHabitCount = completedQuestionCount > 0 ? footprintMission.secondarySkills.length : 0;
  const weeklyGoal = 3;
  const weeklyProgress = Math.min(100, Math.round((completedMissionCount / weeklyGoal) * 100));

  return (
    <>
      <BrandHeader />
      <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 pt-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#806d54]">Xin chào, ba/mẹ!</p>
            <h1 className="text-2xl font-black">Cùng nhìn lại tuần của {childName}</h1>
          </div>
          <Image
            src="/assets/props/shelf-books-lamp-plant.png"
            width={110}
            height={80}
            alt="Kệ sách gia đình"
            className="h-16 w-24 object-contain"
          />
        </div>
        <Card className="mt-5 flex items-center gap-4 p-4">
          <Image
            src={assets.dogAvatar}
            width={82}
            height={82}
            alt={`Avatar của ${childName}`}
            className="size-20 rounded-full bg-[#f1eadc] object-contain"
          />
          <div className="flex-1">
            <p className="text-xl font-black">{childName}</p>
            <p className="text-sm text-[#806d54]">
              Nhóm tuổi {profile?.ageGroup ?? "4–5"} · Nhà thám hiểm nhí
            </p>
          </div>
          <Link href="/profiles" className="rounded-full border border-[#eadfc9] px-3 py-2 text-sm font-bold">
            Đổi bé
          </Link>
        </Card>
        <Card className="mt-5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Tổng quan tuần này</h2>
            <Pill>7 ngày gần nhất</Pill>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-[#fff0dd] p-3">
              <p className="text-3xl font-black text-[#dd5e16]">{completedQuestionCount}</p>
              <p className="text-xs font-bold">Câu đã hoàn thành</p>
            </div>
            <div className="rounded-2xl bg-[#edf4df] p-3">
              <p data-testid="completed-missions" className="text-3xl font-black text-[#5d8748]">
                {completedMissionCount}
              </p>
              <p className="text-xs font-bold">Nhiệm vụ</p>
            </div>
            <div className="rounded-2xl bg-[#ece8fa] p-3">
              <p className="text-3xl font-black text-[#7159a0]">{thinkingHabitCount}</p>
              <p className="text-xs font-bold">Thói quen nghĩ</p>
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#efe2ca]">
            <div
              className="h-full rounded-full bg-[#e9641a] transition-[width]"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[#806d54]">
            {completedMissionCount > 0
              ? `${childName} đã hoàn thành ${completedMissionCount}/${weeklyGoal} nhiệm vụ tuần này và đang kiên trì thử lại.`
              : `Tuần này ${childName} chưa hoàn thành nhiệm vụ nào. Một nhiệm vụ ngắn là khởi đầu vừa đủ.`}
          </p>
        </Card>
        <Card className="mt-5 flex gap-4 bg-[#eaf3df] p-5">
          <Image
            src={assets.parent}
            width={130}
            height={110}
            alt="Phụ huynh trò chuyện cùng bé"
            className="h-24 w-28 rounded-2xl object-cover"
          />
          <div>
            <p className="text-xs font-black tracking-wider text-[#608049] uppercase">
              Gợi ý trò chuyện cùng bé
            </p>
            <h2 className="mt-1 text-lg font-black">“Con đã thử cách nào trước?”</h2>
            <p className="mt-1 text-sm text-[#61724f]">
              Khuyến khích bé kể lại cách quan sát, không chỉ nói đáp án.
            </p>
          </div>
        </Card>
        <h2 className="mt-6 text-xl font-black">Giá trị ba/mẹ nhận được</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            [assets.privacy, "An toàn & riêng tư"],
            [assets.growth, "Phát triển tự nhiên"],
            [assets.family, "Đồng hành tích cực"],
          ].map(([src, label]) => (
            <Card key={label} className="p-3 text-center">
              <Image src={src} width={60} height={60} alt="" className="mx-auto size-14 object-contain" />
              <p className="mt-2 text-xs font-black">{label}</p>
            </Card>
          ))}
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex h-20 max-w-[470px] items-center justify-around border-t border-[#eadfc9] bg-[#fffaf0]/95 px-2 backdrop-blur">
        {parentTabs.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            aria-label={`${label}${active ? ", đang chọn" : ", sắp ra mắt"}`}
            disabled={!active}
            className={`text-center text-xs font-bold ${active ? "text-[#e9641a]" : "opacity-55"}`}
          >
            <Icon className="mx-auto" size={21} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
