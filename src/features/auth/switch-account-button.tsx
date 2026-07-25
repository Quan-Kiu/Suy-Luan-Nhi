"use client";

import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useSignOutNavigation } from "@/features/auth/use-sign-out-navigation";

export function SwitchAccountButton({
  callbackUrl = "/admin",
  label = "Đăng nhập bằng tài khoản khác",
  pendingLabel = "Đang chuyển tài khoản...",
  className,
}: {
  callbackUrl?: string;
  label?: string;
  pendingLabel?: string;
  className?: string;
}) {
  const signOutFlow = useSignOutNavigation(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);

  return (
    <Button
      type="button"
      className={className ?? "w-full"}
      disabled={signOutFlow.pending}
      aria-busy={signOutFlow.pending}
      onClick={() => void signOutFlow.signOutAndNavigate()}
    >
      {signOutFlow.pending ? <LoaderCircle size={18} className="mr-2 inline animate-spin" /> : null}
      {signOutFlow.pending ? pendingLabel : label}
    </Button>
  );
}
