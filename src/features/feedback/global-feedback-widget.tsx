"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquarePlus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { feedbackApi } from "@/api/feedback";
import { contentText, useContent } from "@/content/client";
import { queryKeys } from "@/lib/query/keys";

const GlobalFeedbackDialog = dynamic(
  () => import("@/features/feedback/global-feedback-dialog").then((module) => module.GlobalFeedbackDialog),
  {
    loading: () => (
      <div
        data-feedback-ui
        role="status"
        className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-5"
      >
        <div className="rounded-2xl bg-white px-5 py-4 font-bold shadow-xl">Đang mở biểu mẫu góp ý...</div>
      </div>
    ),
  },
);

export function GlobalFeedbackWidget() {
  const common = useContent("common");
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const configQuery = useQuery({
    queryKey: queryKeys.feedback.uploadConfig,
    queryFn: feedbackApi.getUploadConfig,
    staleTime: 5 * 60 * 1000,
  });

  const config = configQuery.data;
  if (!config && !hasOpened) return null;

  function openDialog() {
    if (!config?.enabled) return;
    setHasOpened(true);
    setOpen(true);
  }

  return (
    <>
      {config?.enabled ? (
        <button
          data-feedback-ui
          type="button"
          onClick={openDialog}
          aria-label={contentText(common, "feedback.open", "Gửi góp ý về trang này")}
          className="safe-area-floating-action fixed z-[55] inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-l-full rounded-r-none border border-r-0 border-[#e4cfaa] bg-white px-3 font-black text-[#8f3a0c] shadow-[0_10px_30px_rgba(71,45,17,0.22)] transition hover:-translate-y-0.5 hover:bg-[#fff7eb] sm:rounded-full sm:border-r sm:px-3.5"
        >
          <MessageSquarePlus size={19} />
          <span className="hidden sm:inline">{contentText(common, "feedback.button", "Góp ý")}</span>
        </button>
      ) : null}

      {hasOpened && config ? (
        <GlobalFeedbackDialog open={open} config={config} common={common} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
