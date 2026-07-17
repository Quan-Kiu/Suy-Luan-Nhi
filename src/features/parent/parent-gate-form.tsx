"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parentApi } from "@/api/parent";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";

const schema = z.object({ answer: z.string().trim().min(1, "Hãy nhập câu trả lời") });

type FormValues = z.infer<typeof schema>;

export function ParentGateForm({ hasPin }: { hasPin: boolean }) {
  const content = useContent("parent");
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { answer: "" } });
  const mutation = useMutation({
    mutationFn: parentApi.unlock,
    onSuccess: () => router.refresh(),
  });

  return (
    <Card className="mx-auto mt-7 max-w-md p-5">
      <div className="flex items-center gap-3">
        <LockKeyhole className="text-[#6b8d4a]" />
        <p className="font-black">
          {contentText(content, "gate.confirmTitle", "Ba/mẹ xác nhận giúp Bống nhé")}
        </p>
      </div>
      <p className="mt-4 text-center text-2xl font-black">
        {hasPin
          ? contentText(content, "gate.pinPrompt", "Nhập PIN phụ huynh")
          : contentText(content, "gate.mathQuestion", "17 + 6 = ?")}
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <TextField
          inputMode="numeric"
          label={hasPin ? "PIN phụ huynh" : "Kết quả phép tính"}
          placeholder={
            hasPin
              ? contentText(content, "gate.pinPlaceholder", "Nhập PIN 4–8 chữ số")
              : contentText(content, "gate.answerPlaceholder", "Nhập kết quả")
          }
          registration={form.register("answer")}
          error={form.formState.errors.answer?.message}
          className="min-h-14 text-center text-xl"
        />
        <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
        <SubmitButton
          pending={mutation.isPending}
          pendingLabel={contentText(content, "gate.submitting", "Đang kiểm tra...")}
        >
          {contentText(content, "gate.submit", "Mở khu vực phụ huynh")}
        </SubmitButton>
      </form>
    </Card>
  );
}
