"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { requestJson } from "@/lib/http";

type Child = { id: string; displayName: string; ageGroup: string; avatarUrl: string; currentRank: string };

export function ProfileManager({ profiles }: { profiles: Child[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  async function selectChild(child: Child) {
    setPendingId(child.id);
    try {
      await requestJson(`/api/children/${child.id}/select`, { method: "POST" });
      router.push("/missions");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể chọn hồ sơ");
      setPendingId(null);
    }
  }
  async function removeChild(child: Child) {
    if (!window.confirm(`Chuyển hồ sơ “${child.displayName}” vào trạng thái chờ xóa?`)) return;
    setPendingId(child.id);
    try {
      await requestJson(`/api/children/${child.id}`, { method: "DELETE" });
      toast.success("Đã ghi nhận yêu cầu xóa hồ sơ");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa hồ sơ");
    }
    setPendingId(null);
  }
  return (
    <div className="space-y-4">
      {profiles.map((child) => (
        <Card key={child.id} className="flex items-center gap-4 p-4">
          <Image
            src={child.avatarUrl}
            width={84}
            height={84}
            alt={`Avatar của ${child.displayName}`}
            className="size-20 rounded-full bg-[#f1eadc] object-contain"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-black">{child.displayName}</h2>
            <p className="text-sm text-[#806d54]">
              Nhóm tuổi {child.ageGroup} · {child.currentRank}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              aria-label={`Chỉnh sửa ${child.displayName}`}
              href={`/profiles/${child.id}/edit`}
              className="grid size-11 place-items-center rounded-xl border border-[#eadfc9] bg-white"
            >
              <Pencil size={18} />
            </Link>
            <button
              aria-label={`Xóa ${child.displayName}`}
              type="button"
              onClick={() => removeChild(child)}
              disabled={pendingId === child.id}
              className="grid size-11 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <Button
            type="button"
            onClick={() => selectChild(child)}
            disabled={pendingId === child.id}
            className="hidden sm:block"
          >
            <Play size={18} className="mr-2 inline" />
            Vào bản đồ
          </Button>
        </Card>
      ))}
      {profiles.map((child) => (
        <Button
          key={`${child.id}-mobile`}
          type="button"
          onClick={() => selectChild(child)}
          disabled={pendingId === child.id}
          className="w-full sm:hidden"
        >
          Vào bản đồ cùng {child.displayName}
        </Button>
      ))}
      <Link
        href="/onboarding"
        className="block rounded-2xl border-2 border-dashed border-[#d7c39d] bg-white/70 p-5 text-center font-black text-[#6d5738]"
      >
        + Tạo thêm hồ sơ bé
      </Link>
    </div>
  );
}
