import { describe, expect, it } from "vitest";
import {
  createSystemFeedbackSchema,
  systemFeedbackMaxAttachments,
  updateSystemFeedbackSchema,
} from "@/domain/system-feedback";

describe("system feedback schemas", () => {
  it("accepts a compact feedback payload with page context", () => {
    const result = createSystemFeedbackSchema.safeParse({
      content: "Nút tiếp tục bị che trên điện thoại.",
      pagePath: "/missions/demo",
      pageTitle: "Nhiệm vụ demo",
      viewportWidth: "390",
      viewportHeight: "844",
      devicePixelRatio: "3",
      captureMode: "auto",
    });

    expect(result.success).toBe(true);
    expect(systemFeedbackMaxAttachments).toBe(10);
  });

  it("rejects short content and unsupported statuses", () => {
    expect(
      createSystemFeedbackSchema.safeParse({
        content: "Ngắn",
        pagePath: "/",
        viewportWidth: 390,
        viewportHeight: 844,
        devicePixelRatio: 3,
        captureMode: "none",
      }).success,
    ).toBe(false);
    expect(updateSystemFeedbackSchema.safeParse({ status: "deleted" }).success).toBe(false);
    expect(
      createSystemFeedbackSchema.safeParse({
        content: "Đường dẫn bên ngoài không được chấp nhận.",
        pagePath: "//example.com",
        viewportWidth: 390,
        viewportHeight: 844,
        devicePixelRatio: 3,
        captureMode: "none",
      }).success,
    ).toBe(false);
  });
});
