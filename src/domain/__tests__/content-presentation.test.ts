import { describe, expect, it } from "vitest";
import {
  contentHasTemplateVariables,
  getContentAreaMeta,
  getContentCategoryLabel,
  getContentLocationSummary,
  getContentPurpose,
} from "@/domain/content-presentation";

describe("content presentation", () => {
  it("uses ordinary Vietnamese labels", () => {
    expect(getContentAreaMeta("admin").label).toBe("Khu vực quản trị");
    expect(getContentCategoryLabel("missionEditor")).toBe("Soạn nhiệm vụ");
    expect(getContentCategoryLabel("errors")).toBe("Thông báo khi có lỗi");
  });
});

describe("content purpose", () => {
  it("describes content by purpose instead of technical key", () => {
    expect(getContentPurpose("signIn.emailPlaceholder", "ba.me@example.com").label).toBe(
      "Gợi ý trong ô nhập",
    );
    expect(getContentPurpose("errors.network", "Không thể kết nối").label).toBe("Thông báo khi có lỗi");
    expect(getContentLocationSummary("auth", "signIn", "signIn.title", "Đăng nhập")).toContain(
      "đăng nhập và tài khoản",
    );
  });

  it("finds template variables that editors must preserve", () => {
    expect(contentHasTemplateVariables("Đang xem {childName} · {count} hoạt động")).toEqual([
      "childName",
      "count",
    ]);
  });
});
