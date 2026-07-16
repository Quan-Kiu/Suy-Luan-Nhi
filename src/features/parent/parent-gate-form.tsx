"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { requestJson } from "@/lib/http";
import { contentText, useContent } from "@/content/client";

export function ParentGateForm({ hasPin }: { hasPin: boolean }) {
  const content = useContent("parent");
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <Card className="mx-auto mt-7 max-w-md p-5">
      <div className="flex items-center gap-3">
        <LockKeyhole className="text-[#6b8d4a]" />
        <p className="font-black">Ba/mẹ xác nhận giúp Bống nhé</p>
      </div>
      <p className="mt-4 text-center text-2xl font-black">
        {hasPin ? "Nhập PIN phụ huynh" : contentText(content, "gate.mathQuestion", "17 + 6 = ?")}
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          try {
            await requestJson("/api/parent/unlock", {
              method: "POST",
              body: JSON.stringify({ answer: value }),
            });
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể mở khóa");
            setPending(false);
          }
        }}
      >
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          inputMode="numeric"
          aria-label={hasPin ? "PIN phụ huynh" : "Kết quả phép tính"}
          placeholder={
            hasPin ? "Nhập PIN 4–8 chữ số" : contentText(content, "gate.answerPlaceholder", "Nhập kết quả")
          }
          className="min-h-14 w-full rounded-2xl border-2 border-[#eadfc9] bg-white px-4 text-center text-xl"
        />
        <Button className="w-full" disabled={pending || !value}>
          {pending ? "Đang kiểm tra..." : "Mở khu vực phụ huynh"}
        </Button>
      </form>
    </Card>
  );
}
