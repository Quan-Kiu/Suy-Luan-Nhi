"use client";

import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, CircleAlert, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import type { EmailVerificationResult } from "@/auth/email-verification";
import { contentText, useContent } from "@/content/client";

export function EmailVerificationResultDialog({
  result,
  continueHref,
}: {
  result: EmailVerificationResult;
  continueHref: string;
}) {
  const content = useContent("auth");
  const titleId = useId();
  const descriptionId = useId();
  const primaryActionRef = useRef<HTMLAnchorElement>(null);
  const successful = result === "success";

  useEffect(() => {
    const frame = requestAnimationFrame(() => primaryActionRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  const title = successful
    ? contentText(content, "verification.successTitle", "Xác minh email thành công")
    : result === "expired"
      ? contentText(content, "verification.expiredTitle", "Liên kết xác minh đã hết hạn")
      : result === "invalid"
        ? contentText(content, "verification.invalidTitle", "Liên kết xác minh không hợp lệ")
        : contentText(content, "verification.errorTitle", "Chưa thể xác minh email");
  const description = successful
    ? contentText(
        content,
        "verification.successDescription",
        "Email của ba/mẹ đã được xác minh. Tài khoản đã sẵn sàng để sử dụng.",
      )
    : result === "expired"
      ? contentText(
          content,
          "verification.expiredDescription",
          "Liên kết này đã quá thời hạn. Hãy đăng nhập để yêu cầu một email xác minh mới.",
        )
      : result === "invalid"
        ? contentText(
            content,
            "verification.invalidDescription",
            "Liên kết này không còn dùng được. Hãy đăng nhập để gửi lại email xác minh.",
          )
        : contentText(
            content,
            "verification.errorDescription",
            "Hệ thống chưa thể hoàn tất xác minh. Hãy đăng nhập và thử gửi lại email xác minh.",
          );
  const primaryHref = successful
    ? continueHref
    : `/auth/sign-in?callbackUrl=${encodeURIComponent(continueHref)}`;

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center overflow-y-auto bg-[#2f2419]/60 p-4 backdrop-blur-sm">
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-[30px] border border-[#ead8bc] bg-[#fffdf8] p-6 text-center shadow-2xl sm:p-8"
        initial={false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <span
          className={`mx-auto grid size-20 place-items-center rounded-[28px] ${
            successful ? "bg-[#e8f4d9] text-[#4f713d]" : "bg-[#fff0dc] text-[#b9470d]"
          }`}
        >
          {successful ? (
            <CheckCircle2 size={42} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <CircleAlert size={40} strokeWidth={2.4} aria-hidden="true" />
          )}
        </span>
        <h1 id={titleId} className="mt-5 text-2xl font-black text-[#34291f] sm:text-3xl">
          {title}
        </h1>
        <p id={descriptionId} className="mt-3 text-sm leading-6 text-[#74634f] sm:text-base">
          {description}
        </p>
        <div className="mt-7 space-y-3">
          <Link
            ref={primaryActionRef}
            href={primaryHref}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#b9470d] px-5 font-black text-white shadow-[0_5px_0_#7f300b] transition-transform outline-none hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#e8b58f]"
          >
            {successful
              ? contentText(content, "verification.continue", "Tiếp tục")
              : contentText(content, "verification.signInAgain", "Đăng nhập để gửi lại")}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#d9c9ae] bg-white px-4 font-black text-[#554a3c] outline-none hover:bg-[#fff8ec] focus-visible:ring-4 focus-visible:ring-[#ead8bc]"
          >
            <Home size={17} aria-hidden="true" />
            {contentText(content, "verification.home", "Về trang chủ")}
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
