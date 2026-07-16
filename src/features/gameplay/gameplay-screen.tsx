"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lightbulb, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { BrandHeader } from "@/components/brand-header";
import { QuestionRenderer } from "@/components/question-renderer";
import { Button, Card, Pill } from "@/components/ui";
import { footprintMission } from "@/domain/content";
import { markMissionComplete } from "@/lib/progress-store";
import { evaluateAnswer } from "@/lib/utils";

export function GameplayScreen() {
  const router = useRouter();
  const currentQuestionIndex = 0;
  const totalQuestions = footprintMission.questions.length;
  const question = footprintMission.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [hintLevel, setHintLevel] = useState(0);

  function checkAnswer() {
    if (!selected) return;
    setStatus(evaluateAnswer(selected, question.correctAnswer) ? "correct" : "incorrect");
  }

  function showHint() {
    setHintLevel((level) => Math.min(level + 1, question.hints.length));
  }

  function retry() {
    setSelected(null);
    setStatus("idle");
    showHint();
  }

  function complete() {
    const persisted = markMissionComplete(footprintMission.id);
    if (!persisted) toast.warning("Đã hoàn thành nhiệm vụ, nhưng trình duyệt chưa lưu được tiến độ.");
    router.push("/complete");
  }

  return (
    <>
      <BrandHeader backHref="/missions/footprint-detective" compact sound />
      <main className="paper-texture min-h-[calc(100vh-4rem)] px-5 pt-5 pb-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[#6f9e50] font-black text-white">
            {currentQuestionIndex + 1}
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#eadfc9]">
            <div className="h-full rounded-full bg-[#6f9e50]" style={{ width: `${progressPercent}%` }} />
          </div>
          <Pill>
            {currentQuestionIndex + 1} / {totalQuestions}
          </Pill>
        </div>
        <div className="text-center">
          <p className="text-sm font-black tracking-[.16em] text-[#d78517] uppercase">Câu hỏi quan sát</p>
          <h1 className="mt-2 text-3xl leading-tight font-black">{question.prompt}</h1>
          <p className="mt-2 text-[#806d54]">{question.instruction}</p>
        </div>

        <div className="mt-5">
          <QuestionRenderer
            question={question}
            selected={selected}
            disabled={status === "correct"}
            onSelect={(id) => {
              setSelected(id);
              setStatus("idle");
            }}
          />
        </div>

        <button
          type="button"
          onClick={showHint}
          disabled={hintLevel >= question.hints.length}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#ebc778] bg-[#fff5cf] font-black text-[#785b18] disabled:opacity-55"
        >
          <Lightbulb size={20} />
          {hintLevel >= question.hints.length ? "Con đã xem hết gợi ý" : "Cho con một gợi ý"}
        </button>
        {hintLevel > 0 ? (
          <Card className="mt-4 flex gap-3 bg-[#fff6d8] p-4">
            <Image
              src="/assets/mascots/mascot-dog-detective.png"
              width={68}
              height={68}
              alt="Bống đang gợi ý"
              className="size-16 object-contain"
            />
            <p className="self-center font-bold text-[#6b552e]">{question.hints[hintLevel - 1]}</p>
          </Card>
        ) : null}

        {status === "correct" ? (
          <Card className="mt-4 border-[#bbd9a4] bg-[#edf6e6] p-4">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/mascots/mascot-hedgehog-thumbs-up.png"
                width={68}
                height={68}
                alt="Nhím chúc mừng"
                className="size-16 object-contain"
              />
              <div>
                <p className="text-xl font-black text-[#477139]">Tuyệt vời!</p>
                <p>{question.feedbackCorrect}</p>
              </div>
            </div>
            <Button type="button" onClick={complete} className="mt-4 w-full">
              <Trophy className="mr-2 inline" size={20} /> Hoàn thành nhiệm vụ
            </Button>
          </Card>
        ) : status === "incorrect" ? (
          <Card className="mt-4 border-[#f2d196] bg-[#fff6df] p-4">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/mascots/mascot-detective-boy-helper.png"
                width={76}
                height={76}
                alt="Bạn nhỏ đang khích lệ"
                className="size-20 object-contain"
              />
              <div>
                <p className="text-xl font-black text-[#b75e13]">Chưa trúng thôi!</p>
                <p>{question.feedbackIncorrect}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={retry}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#6c9951] font-black text-white"
            >
              <RotateCcw size={19} /> Thử lại
            </button>
          </Card>
        ) : (
          <Button type="button" onClick={checkAnswer} disabled={!selected} className="mt-5 w-full">
            Kiểm tra đáp án
          </Button>
        )}

        <p className="mt-6 text-center text-xs text-[#8b795e]">
          Thử lại là một cách tuyệt vời để học.{" "}
          <Link href="/missions" className="font-bold underline">
            Về bản đồ
          </Link>
        </p>
      </main>
    </>
  );
}
