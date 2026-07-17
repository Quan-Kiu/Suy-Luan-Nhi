import { z } from "zod";

export const jsonTextSchema = z.string().refine((value) => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}, "Giá trị phải là JSON hợp lệ. Chuỗi văn bản cần đặt trong dấu ngoặc kép.");

export function parseJsonText<T = unknown>(value: string): T {
  return JSON.parse(value) as T;
}
