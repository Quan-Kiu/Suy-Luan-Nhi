"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { requestJson } from "@/lib/http";

type Settings = {
  soundEnabled: boolean;
  effectsEnabled: boolean;
  notificationSettings: Record<string, boolean>;
  privacySettings: Record<string, boolean>;
};
export function SettingsForm({ initial, childId }: { initial: Settings; childId: string }) {
  const [settings, setSettings] = useState(initial);
  const [pin, setPin] = useState("");
  const [pending, setPending] = useState(false);
  const toggle = (group: "notificationSettings" | "privacySettings", key: string) =>
    setSettings((value) => ({ ...value, [group]: { ...value[group], [key]: !value[group][key] } }));
  async function save() {
    setPending(true);
    try {
      await requestJson("/api/parent/settings", {
        method: "PATCH",
        body: JSON.stringify({ ...settings, pin: pin || undefined }),
      });
      toast.success("Đã lưu cài đặt");
      setPin("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể lưu");
    }
    setPending(false);
  }
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h2 className="text-xl font-black">Âm thanh và hiệu ứng</h2>
        {[
          ["soundEnabled", "Âm thanh hướng dẫn"],
          ["effectsEnabled", "Hiệu ứng chúc mừng"],
        ].map(([key, label]) => (
          <label key={key} className="mt-4 flex items-center justify-between gap-4">
            <span className="font-bold">{label}</span>
            <input
              type="checkbox"
              className="size-6 accent-[#e9641a]"
              checked={settings[key as keyof Settings] as boolean}
              onChange={() => setSettings((value) => ({ ...value, [key]: !value[key as keyof Settings] }))}
            />
          </label>
        ))}
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-black">Thông báo phụ huynh</h2>
        {[
          ["missionCompleted", "Khi bé hoàn thành nhiệm vụ"],
          ["suggestions", "Khi có gợi ý trò chuyện mới"],
          ["weeklySummary", "Tóm tắt tuần"],
        ].map(([key, label]) => (
          <label key={key} className="mt-4 flex items-center justify-between gap-4">
            <span className="font-bold">{label}</span>
            <input
              type="checkbox"
              className="size-6 accent-[#e9641a]"
              checked={settings.notificationSettings[key] ?? false}
              onChange={() => toggle("notificationSettings", key)}
            />
          </label>
        ))}
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-black">Quyền riêng tư</h2>
        <label className="mt-4 flex items-center justify-between gap-4">
          <span>
            <strong className="block">Phân tích sản phẩm tối giản</strong>
            <small className="text-[#806d54]">
              Không dùng quảng cáo, định vị hoặc hồ sơ định danh của bé.
            </small>
          </span>
          <input
            type="checkbox"
            className="size-6 accent-[#e9641a]"
            checked={settings.privacySettings.analytics ?? true}
            onChange={() => toggle("privacySettings", "analytics")}
          />
        </label>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-black">PIN phụ huynh</h2>
        <p className="mt-1 text-sm text-[#806d54]">Đặt 4–8 chữ số để thay phép tính ở Parent Gate.</p>
        <input
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))}
          inputMode="numeric"
          placeholder="PIN mới"
          className="mt-3 min-h-12 w-full rounded-2xl border-2 border-[#eadfc9] px-4"
        />
      </Card>
      <Button type="button" onClick={save} disabled={pending} className="w-full">
        {pending ? "Đang lưu..." : "Lưu cài đặt"}
      </Button>
      <Card className="p-5">
        <h2 className="text-xl font-black">Dữ liệu gia đình</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={async () => {
              const result = await requestJson<{ downloadUrl: string }>("/api/parent/export-data", {
                method: "POST",
              });
              toast.success("Gói dữ liệu đã sẵn sàng");
              window.location.assign(result.downloadUrl);
            }}
            className="rounded-2xl border p-3 font-bold"
          >
            Yêu cầu xuất dữ liệu
          </button>
          <button
            type="button"
            onClick={async () => {
              if (confirm("Xóa toàn bộ tiến độ của hồ sơ đang chọn?")) {
                await requestJson(`/api/children/${childId}/reset-progress`, { method: "POST" });
                toast.success("Đã xóa tiến độ");
              }
            }}
            className="rounded-2xl border border-amber-300 bg-amber-50 p-3 font-bold text-amber-800"
          >
            Đặt lại tiến độ bé
          </button>
          <button
            type="button"
            onClick={async () => {
              if (confirm("Gửi yêu cầu xóa dữ liệu gia đình?")) {
                await requestJson("/api/parent/delete-data-request", { method: "POST" });
                toast.success("Đã ghi nhận yêu cầu xóa");
              }
            }}
            className="rounded-2xl border border-red-300 bg-red-50 p-3 font-bold text-red-700"
          >
            Yêu cầu xóa dữ liệu
          </button>
        </div>
      </Card>
    </div>
  );
}
