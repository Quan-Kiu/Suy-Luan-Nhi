import type { ContentValue } from "@/content/types";

export const contentValueTypes = ["text", "number", "boolean", "json"] as const;
export type ContentValueType = (typeof contentValueTypes)[number];

export function classifyContentValue(value: ContentValue): ContentValueType {
  if (typeof value === "string" || value === null) return "text";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "json";
}

export function contentCategoryFromKey(key: string) {
  const [category] = key.split(".");
  return category?.trim() || "general";
}

export const contentTypeLabels: Record<ContentValueType, string> = {
  text: "Câu chữ",
  number: "Số liệu",
  boolean: "Bật/tắt",
  json: "Dữ liệu cấu trúc",
};
