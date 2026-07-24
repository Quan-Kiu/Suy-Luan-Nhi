import type { Metadata } from "next";
import { Suspense } from "react";
import { contentText } from "@/content/resolve";
import { AuthShell } from "@/features/auth/auth-shell";
import { ResetParentPinForm } from "@/features/auth/auth-forms";
import { getContentNamespace } from "@/modules/content/content";

export const metadata: Metadata = {
  title: "Tạo mã PIN mới",
};

export default async function Page() {
  const content = await getContentNamespace("auth");
  return (
    <AuthShell
      title={contentText(content, "pinReset.resetTitle", "Tạo mã PIN mới")}
      subtitle={contentText(
        content,
        "pinReset.resetSubtitle",
        "Chọn mã PIN 6 chữ số khó đoán và chỉ ba/mẹ biết.",
      )}
    >
      <Suspense>
        <ResetParentPinForm />
      </Suspense>
    </AuthShell>
  );
}
