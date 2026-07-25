import type { Metadata } from "next";
import { contentText } from "@/content/resolve";
import { requireParent } from "@/auth/session";
import { AuthShell } from "@/features/auth/auth-shell";
import { ForgotParentPinForm } from "@/features/auth/auth-forms";
import { SwitchAccountButton } from "@/features/auth/switch-account-button";
import { getContentNamespace } from "@/modules/content/content";

export const metadata: Metadata = {
  title: "Quên mã PIN phụ huynh",
};

export default async function Page() {
  const [session, content] = await Promise.all([requireParent(), getContentNamespace("auth")]);
  return (
    <AuthShell
      title={contentText(content, "pinReset.requestTitle", "Quên mã PIN phụ huynh")}
      subtitle={contentText(
        content,
        "pinReset.requestSubtitle",
        "Xác nhận qua email để tạo mã PIN mới an toàn.",
      )}
    >
      <ForgotParentPinForm email={session.user.email} />
      <div className="mt-5 border-t border-[#eadfc9] pt-5">
        <SwitchAccountButton
          callbackUrl="/parent"
          label="Đăng xuất và dùng tài khoản khác"
          pendingLabel="Đang đăng xuất..."
        />
      </div>
    </AuthShell>
  );
}
