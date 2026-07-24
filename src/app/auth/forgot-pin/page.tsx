import type { Metadata } from "next";
import { contentText } from "@/content/resolve";
import { requireParent } from "@/auth/session";
import { AuthShell } from "@/features/auth/auth-shell";
import { ForgotParentPinForm } from "@/features/auth/auth-forms";
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
    </AuthShell>
  );
}
