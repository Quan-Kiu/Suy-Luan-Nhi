import { getManagedSystemSettingDefinition } from "@/domain/system-settings";

export const systemSettingKinds = ["boolean", "number", "text", "structured"] as const;
export type SystemSettingKind = (typeof systemSettingKinds)[number];

function titleCase(value: string) {
  return value.charAt(0).toLocaleUpperCase("vi") + value.slice(1);
}

export function humanizeSettingKey(key: string) {
  const definition = getManagedSystemSettingDefinition(key);
  if (definition) return definition.label;
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim()
    .toLocaleLowerCase("vi");
  return titleCase(words || "Cấu hình chưa đặt tên");
}

export function describeSetting(key: string) {
  return (
    getManagedSystemSettingDefinition(key)?.description ??
    "Thiết lập này ảnh hưởng đến cách hệ thống hoạt động. Hãy kiểm tra sau khi lưu."
  );
}

export function getSystemSettingKind(value: unknown): SystemSettingKind {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "text";
  return "structured";
}

export const systemSettingKindLabels: Record<SystemSettingKind, string> = {
  boolean: "Lựa chọn bật hoặc tắt",
  number: "Giá trị số",
  text: "Câu chữ hoặc mã ngắn",
  structured: "Nội dung nâng cao",
};

export function serializeSystemSetting(value: unknown, kind = getSystemSettingKind(value)) {
  if (kind === "boolean") return "";
  if (kind === "structured") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

export function parseSystemSetting(kind: SystemSettingKind, text: string, enabled: boolean) {
  if (kind === "boolean") return enabled;
  if (kind === "number") {
    const value = Number(text);
    if (!Number.isFinite(value)) throw new Error("Hãy nhập một số hợp lệ");
    return value;
  }
  if (kind === "structured") {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new Error("Nội dung nâng cao chưa đúng cấu trúc. Kiểm tra dấu ngoặc, dấu phẩy và dấu nháy.");
    }
  }
  return text.trim();
}
