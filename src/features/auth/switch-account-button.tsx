"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/auth/client";
import { Button } from "@/components/ui";

export function SwitchAccountButton({ callbackUrl = "/admin" }: { callbackUrl?: string }) {
  const router = useRouter();

  return (
    <Button
      type="button"
      className="w-full"
      onClick={async () => {
        await signOut();
        router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        router.refresh();
      }}
    >
      Đăng nhập bằng tài khoản khác
    </Button>
  );
}
