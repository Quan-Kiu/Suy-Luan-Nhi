"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Calculator, KeyRound, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parentApi } from "@/api/parent";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { usePendingRouter } from "@/hooks/use-pending-router";
import type { ParentMathChallenge } from "@/modules/family/parent-challenge";

const schema = z.object({ answer: z.string().trim().min(1, "Hãy nhập câu trả lời") });
type FormValues = z.infer<typeof schema>;
type GateMethod = "pin" | "math";

export function ParentGateForm({ hasPin, challenge }: { hasPin: boolean; challenge: ParentMathChallenge }) {
  const content = useContent("parent");
  const navigation = usePendingRouter();
  const [method, setMethod] = useState<GateMethod>(hasPin ? "pin" : "math");
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { answer: "" } });
  const mutation = useMutation({
    mutationFn: ({ answer }: FormValues) =>
      parentApi.unlock({
        answer,
        method,
        challengeToken: method === "math" ? challenge.token : undefined,
      }),
    onSuccess: () => navigation.refresh(),
  });

  function changeMethod(next: GateMethod) {
    setMethod(next);
    mutation.reset();
    form.reset({ answer: "" });
  }

  const prompt =
    method === "pin" ? contentText(content, "gate.pinPrompt", "Nhập PIN phụ huynh") : challenge.prompt;

  return (
    <Card className="mx-auto mt-7 max-w-md p-5">
      <div className="flex items-center gap-3">
        <LockKeyhole className="text-[#6b8d4a]" />
        <p className="font-black">
          {contentText(content, "gate.confirmTitle", "Ba/mẹ xác nhận giúp Bống nhé")}
        </p>
      </div>
      {hasPin ? (
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#f5f0e6] p-1.5">
          <button
            type="button"
            aria-pressed={method === "pin"}
            onClick={() => changeMethod("pin")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl font-black transition ${
              method === "pin" ? "bg-white text-[#9f3d0b] shadow-sm" : "text-[#6f6558]"
            }`}
          >
            <KeyRound size={18} /> Dùng PIN
          </button>
          <button
            type="button"
            aria-pressed={method === "math"}
            onClick={() => changeMethod("math")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl font-black transition ${
              method === "math" ? "bg-white text-[#9f3d0b] shadow-sm" : "text-[#6f6558]"
            }`}
          >
            <Calculator size={18} /> Trả lời toán
          </button>
        </div>
      ) : null}
      <p className="type-child-section-title mt-5 text-center" aria-live="polite">
        {prompt}
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <TextField
          type={method === "pin" ? "password" : "text"}
          inputMode="numeric"
          label={method === "pin" ? "PIN phụ huynh" : "Kết quả phép tính"}
          placeholder={
            method === "pin"
              ? contentText(content, "gate.pinPlaceholder", "Nhập PIN 4–8 chữ số")
              : contentText(content, "gate.answerPlaceholder", "Nhập kết quả")
          }
          registration={form.register("answer", {
            onChange: (event) => {
              event.target.value = event.target.value.replace(/[^0-9-]/g, "").slice(0, 8);
            },
          })}
          error={form.formState.errors.answer?.message}
          className="type-child-section-title min-h-14 text-center"
        />
        <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
        <SubmitButton
          pending={mutation.isPending || navigation.isPending}
          pendingLabel={contentText(content, "gate.submitting", "Đang kiểm tra...")}
        >
          {contentText(content, "gate.submit", "Mở khu vực phụ huynh")}
        </SubmitButton>
      </form>
    </Card>
  );
}
