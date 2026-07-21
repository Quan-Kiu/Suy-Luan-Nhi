import { describe, expect, it } from "vitest";
import { z } from "zod";
import { vietnameseZodError } from "@/lib/validation/zod-locale";

describe("vietnameseZodError", () => {
  it("uses everyday Vietnamese for default string limits", () => {
    const result = z.string().min(3).safeParse("a", { error: vietnameseZodError });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe("Vui lòng nhập ít nhất 3 ký tự.");
  });

  it("uses Vietnamese for invalid selections", () => {
    const result = z.string().uuid().safeParse("", { error: vietnameseZodError });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe("Dữ liệu đã chọn không hợp lệ.");
  });
});
