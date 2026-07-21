"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { reviewsApi } from "@/api/admin/reviews";
import { FormStatus, TextareaField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";

const schema = z.object({ comment: z.string().trim().max(2000, "Lời nhắn không được quá 2000 ký tự") });
type FormValues = z.infer<typeof schema>;
type Action = "approve" | "reject";

export function ReviewDecisionForm({ missionId, versionId }: { missionId: string; versionId: string }) {
  const content = useContent("admin");
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { comment: "" } });
  const mutation = useMutation({
    mutationFn: ({ action, comment }: FormValues & { action: Action }) =>
      reviewsApi.decide(missionId, versionId, action, comment).then(() => action),
    onSuccess: async (action) => {
      toast.success(
        action === "approve"
          ? contentText(content, "review.approveSuccess", "Đã xác nhận nội dung đạt yêu cầu")
          : contentText(content, "review.rejectSuccess", "Đã trả lại để chỉnh sửa"),
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.missions });
      navigation.refresh();
    },
  });

  function submit(action: Action) {
    form.clearErrors("comment");
    if (action === "reject" && form.getValues("comment").trim().length < 4) {
      form.setError(
        "comment",
        { type: "manual", message: "Hãy ghi ít nhất 4 ký tự để người soạn biết cần sửa gì" },
        { shouldFocus: true },
      );
      return;
    }
    void form.handleSubmit((values) =>
      mutation.mutate({ ...values, comment: values.comment.trim(), action }),
    )();
  }

  return (
    <form className="space-y-3" onSubmit={(event) => event.preventDefault()} noValidate>
      <TextareaField
        label={contentText(content, "review.commentLabel", "Lời nhắn cho người soạn")}
        rows={5}
        description={contentText(
          content,
          "review.commentDescription",
          "Có thể để trống khi nội dung đã ổn. Nếu cần sửa, hãy ghi rõ phần nào và nên sửa thế nào.",
        )}
        placeholder={contentText(
          content,
          "review.commentPlaceholder",
          "Nêu rõ phần cần sửa và cách sửa mong muốn...",
        )}
        registration={form.register("comment")}
        error={form.formState.errors.comment?.message}
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => submit("approve")}
          disabled={mutation.isPending || navigation.isPending}
          aria-busy={mutation.isPending || navigation.isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#517d3f] px-4 font-black text-white disabled:opacity-50"
        >
          <CheckCircle2 size={18} />
          {(mutation.isPending || navigation.isPending) && mutation.variables?.action === "approve"
            ? contentText(content, "review.approving", "Đang xác nhận...")
            : contentText(content, "review.approve", "Đạt yêu cầu")}
        </button>
        <button
          type="button"
          onClick={() => submit("reject")}
          disabled={mutation.isPending || navigation.isPending}
          aria-busy={mutation.isPending || navigation.isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-700 px-4 font-black text-white disabled:opacity-50"
        >
          <XCircle size={18} />
          {(mutation.isPending || navigation.isPending) && mutation.variables?.action === "reject"
            ? contentText(content, "review.rejecting", "Đang trả lại...")
            : contentText(content, "review.reject", "Gửi lại để sửa")}
        </button>
      </div>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
    </form>
  );
}
