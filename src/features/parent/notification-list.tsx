"use client";
import { useRouter } from "next/navigation";
import { requestJson } from "@/lib/http";
export function NotificationList({
  items,
}: {
  items: Array<{ id: string; title: string; body: string; readAt: Date | null; createdAt: Date }>;
}) {
  const router = useRouter();
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={async () => {
            if (!item.readAt)
              await requestJson(`/api/parent/notifications/${item.id}/read`, { method: "POST" });
            router.refresh();
          }}
          className={`w-full rounded-2xl border p-4 text-left ${item.readAt ? "bg-white" : "border-[#e6a35e] bg-[#fff5df]"}`}
        >
          <div className="flex justify-between gap-3">
            <strong>{item.title}</strong>
            <time className="text-xs text-[#806d54]">
              {new Date(item.createdAt).toLocaleDateString("vi-VN")}
            </time>
          </div>
          <p className="mt-1 text-sm text-[#6f604b]">{item.body}</p>
        </button>
      ))}
    </div>
  );
}
