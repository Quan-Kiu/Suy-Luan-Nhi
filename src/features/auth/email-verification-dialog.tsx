"use client";

import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, RefreshCw, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { FormStatus } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { EmailVerificationGuidance } from "@/features/auth/email-verification-guidance";
import { useVerificationResend } from "@/features/auth/use-verification-resend";

export function EmailVerificationDialog({
  open,
  email,
  callbackURL,
  retryPending,
  onRetry,
  onClose,
}: {
  open: boolean;
  email: string;
  callbackURL?: string;
  retryPending?: boolean;
  onRetry: () => void;
  onClose: () => void;
}) {
  const content = useContent("auth");
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const resend = useVerificationResend(email, callbackURL);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !resend.pending && !retryPending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open, resend.pending, retryPending]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-[#2f2419]/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !resend.pending && !retryPending) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="relative w-full max-w-md rounded-[30px] border border-[#ead8bc] bg-[#fffdf8] p-5 shadow-2xl sm:p-7"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
          >
            <button
              ref={closeRef}
              type="button"
              aria-label={contentText(content, "verification.close", "Đóng")}
              disabled={resend.pending || retryPending}
              onClick={onClose}
              className="absolute top-4 right-4 grid size-10 place-items-center rounded-full border border-[#ead8bc] bg-white text-[#5d5143] disabled:opacity-40"
            >
              <X size={18} />
            </button>
            <EmailVerificationGuidance
              email={email}
              mode="sign-in"
              titleId={titleId}
              descriptionId={descriptionId}
            />
            <div className="mt-5 space-y-3">
              <button
                type="button"
                disabled={resend.pending || retryPending}
                onClick={resend.resend}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#c94b18] px-5 font-black text-white shadow-[0_5px_0_#8d3313] disabled:opacity-60"
              >
                {resend.pending ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
                {resend.pending
                  ? contentText(content, "verification.resending", "Đang gửi lại...")
                  : contentText(content, "verification.resend", "Gửi lại email xác minh")}
              </button>
              <FormStatus status={resend.status} message={resend.message} />
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={resend.pending || retryPending}
                  onClick={onClose}
                  className="min-h-11 rounded-2xl border border-[#d9c9ae] bg-white px-4 font-black text-[#554a3c] disabled:opacity-50"
                >
                  {contentText(content, "verification.later", "Để sau")}
                </button>
                <button
                  type="button"
                  disabled={resend.pending || retryPending}
                  onClick={onRetry}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#edf4df] px-4 font-black text-[#4f713d] disabled:opacity-50"
                >
                  {retryPending ? <LoaderCircle size={17} className="animate-spin" /> : null}
                  {contentText(content, "verification.retry", "Đã xác minh, thử lại")}
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
