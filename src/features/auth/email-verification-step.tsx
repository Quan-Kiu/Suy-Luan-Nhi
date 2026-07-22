"use client";

import Link from "next/link";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { FormStatus } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { EmailVerificationGuidance } from "@/features/auth/email-verification-guidance";
import { useVerificationResend } from "@/features/auth/use-verification-resend";

export function EmailVerificationStep({
  email,
  onUseDifferentEmail,
}: {
  email: string;
  onUseDifferentEmail: () => void;
}) {
  const content = useContent("auth");
  const resend = useVerificationResend(email);
  return (
    <section aria-live="polite" className="rounded-[26px] bg-[#fffaf1] p-1">
      <EmailVerificationGuidance email={email} mode="sign-up" />
      <div className="mt-5 space-y-3">
        <button
          type="button"
          disabled={resend.pending}
          onClick={resend.resend}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#c94b18] px-5 font-black text-white shadow-[0_5px_0_#8d3313] disabled:opacity-60"
        >
          {resend.pending ? <LoaderCircle size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          {resend.pending
            ? contentText(content, "verification.resending", "Đang gửi lại...")
            : contentText(content, "verification.resend", "Gửi lại email xác minh")}
        </button>
        <FormStatus status={resend.status} message={resend.message} />
        <div className="type-supporting grid gap-2 text-center sm:grid-cols-2">
          <button type="button" onClick={onUseDifferentEmail} className="font-bold text-[#c55312] underline">
            {contentText(content, "verification.changeEmail", "Dùng email khác")}
          </button>
          <Link href="/auth/sign-in" className="font-bold text-[#50723e] underline">
            {contentText(content, "verification.backToSignIn", "Quay lại đăng nhập")}
          </Link>
        </div>
      </div>
    </section>
  );
}
