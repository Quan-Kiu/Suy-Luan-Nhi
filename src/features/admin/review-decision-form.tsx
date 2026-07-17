"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { reviewsApi } from "@/api/admin/reviews";
import { FormStatus, TextareaField } from "@/components/form";
import { contentText, useContent } from "@/content/client";

const schema = z.object({ comment: z.string().trim().min(4, "Reviewer cần ghi nhận xét ít nhất 4 ký tự") });
type FormValues = z.infer<typeof schema>;
type Action = "approve" | "reject";

export function ReviewDecisionForm({ missionId, versionId }: { missionId: string; versionId: string }) {
  const content = useContent("admin");
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { comment: "" } });
  const mutation = useMutation({
    mutationFn: ({ action, comment }: FormValues & { action: Action }) =>
      reviewsApi.decide(missionId, versionId, action, comment).then(() => action),
    onSuccess: (action) => {
      toast.success(
        action === "approve"
          ? contentText(content, "review.approveSuccess", "Đã duyệt phiên bản")
          : contentText(content, "review.rejectSuccess", "Đã trả lại để chỉnh sửa"),
      );
      router.refresh();
    },
  });

  function submit(action: Action) {
    void form.handleSubmit((values) => mutation.mutate({ ...values, action }))();
  }

  return (
    <form className="space-y-3" onSubmit={(event) => event.preventDefault()} noValidate>
      <TextareaField
        label={contentText(content, "review.commentLabel", "Nhận xét reviewer")}
        rows={5}
        placeholder={contentText(
          content,
          "review.commentPlaceholder",
          "Nêu rõ lý do duyệt hoặc nội dung cần chỉnh sửa...",
        )}
        registration={form.register("comment")}
        error={form.formState.errors.comment?.message}
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => submit("approve")}
          disabled={mutation.isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5d8c48] px-4 font-black text-white disabled:opacity-50"
        >
          <CheckCircle2 size={18} />
          {mutation.isPending && mutation.variables.action === "approve"
            ? contentText(content, "review.approving", "Đang duyệt...")
            : contentText(content, "review.approve", "Duyệt phiên bản")}
        </button>
        <button
          type="button"
          onClick={() => submit("reject")}
          disabled={mutation.isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-700 px-4 font-black text-white disabled:opacity-50"
        >
          <XCircle size={18} />
          {mutation.isPending && mutation.variables.action === "reject"
            ? contentText(content, "review.rejecting", "Đang trả lại...")
            : contentText(content, "review.reject", "Yêu cầu chỉnh sửa")}
        </button>
      </div>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
    </form>
  );
}
