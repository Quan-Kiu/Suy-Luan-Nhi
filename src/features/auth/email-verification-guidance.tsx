"use client";

import { CheckCircle2, MailCheck } from "lucide-react";
import { contentText, useContent } from "@/content/client";

export function EmailVerificationGuidance({
  email,
  mode,
  titleId,
  descriptionId,
}: {
  email: string;
  mode: "sign-up" | "sign-in";
  titleId?: string;
  descriptionId?: string;
}) {
  const content = useContent("auth");
  const isSignUp = mode === "sign-up";
  return (
    <div className="text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-[22px] bg-[#fff0df] text-[#c94b18] shadow-[0_8px_24px_rgba(185,71,13,.15)]">
        <MailCheck size={32} />
      </span>
      <h2 id={titleId} className="type-section-title mt-4">
        {contentText(
          content,
          isSignUp ? "verification.signUpFlowTitle" : "verification.signInTitle",
          isSignUp ? "Kiểm tra email để sang bước 2" : "Xác minh email để tiếp tục",
        )}
      </h2>
      <p id={descriptionId} className="type-supporting mt-2 text-[#746654]">
        {contentText(
          content,
          isSignUp ? "verification.signUpFlowDescription" : "verification.signInDescription",
          isSignUp
            ? "Tài khoản ba mẹ đã được tạo. Hãy xác minh email, sau đó quay lại để tạo hồ sơ cho bé."
            : "Tài khoản này chưa xác minh email. Hãy hoàn tất bước bảo mật trước khi đăng nhập.",
        )}
      </p>
      <div className="mx-auto mt-4 max-w-sm rounded-2xl border border-[#ead7b9] bg-white px-4 py-3 font-black break-all text-[#4b3f31]">
        {email}
      </div>
      <div className="type-supporting mx-auto mt-5 max-w-sm space-y-3 text-left text-[#5f5446]">
        {[
          contentText(content, "verification.stepOpenEmail", "Mở email từ Suy Luận Nhí"),
          contentText(content, "verification.stepConfirm", "Nhấn “Xác minh email” trong thư"),
          contentText(
            content,
            isSignUp ? "verification.signUpFlowReturn" : "verification.stepReturn",
            isSignUp ? "Quay lại Suy Luận Nhí và tạo hồ sơ cho bé" : "Quay lại và tiếp tục hành trình",
          ),
        ].map((step) => (
          <div key={step} className="flex items-center gap-3">
            <CheckCircle2 size={19} className="shrink-0 text-[#5d8748]" />
            <span>{step}</span>
          </div>
        ))}
      </div>
      <p className="type-caption mt-4 text-[#8a7862]">
        {contentText(
          content,
          "verification.spamHint",
          "Chưa thấy email? Hãy kiểm tra mục Thư rác/Spam hoặc bấm gửi lại bên dưới.",
        )}
      </p>
    </div>
  );
}
