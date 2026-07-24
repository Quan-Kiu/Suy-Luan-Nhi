"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { parentApi } from "@/api/parent";
import { FormStatus, HydrationSafeForm, SubmitButton } from "@/components/form";
import { contentTemplate, contentText, useContent } from "@/content/client";

function maskEmail(email: string) {
  const [localPart = "", domain = ""] = email.split("@");
  if (!domain) return email;
  const visible = localPart.slice(0, Math.min(2, localPart.length));
  return `${visible}${"•".repeat(Math.max(3, localPart.length - visible.length))}@${domain}`;
}

export function ForgotParentPinForm({ email }: { email: string }) {
  const content = useContent("auth");
  const mutation = useMutation({ mutationFn: parentApi.requestPinReset });

  if (mutation.isSuccess) {
    return (
      <div className="space-y-4">
        <FormStatus
          status="success"
          title={contentText(content, "pinReset.sentTitle", "Hãy kiểm tra hộp thư")}
          message={contentText(
            content,
            "pinReset.sentDescription",
            "Liên kết tạo mã PIN mới đã được gửi và có hiệu lực trong 15 phút.",
          )}
        />
        <Link href="/parent" className="block text-center font-bold text-[#c55312] underline">
          {contentText(content, "pinReset.backToGate", "Quay lại nhập mã PIN")}
        </Link>
      </div>
    );
  }

  return (
    <HydrationSafeForm
      busy={mutation.isPending}
      fieldsetClassName="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <p className="type-supporting text-[#786348]">
        {contentTemplate(
          content,
          "pinReset.requestDescription",
          "Hệ thống sẽ gửi liên kết bảo mật tới {email}.",
          { email: maskEmail(email) },
        )}
      </p>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={contentText(content, "pinReset.requesting", "Đang gửi...")}
      >
        {contentText(content, "pinReset.requestSubmit", "Gửi liên kết tạo PIN mới")}
      </SubmitButton>
    </HydrationSafeForm>
  );
}
