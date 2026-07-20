import { describe, expect, it } from "vitest";
import {
  getSystemSettingKind,
  humanizeSettingKey,
  parseSystemSetting,
  serializeSystemSetting,
} from "@/domain/system-setting-presentation";

describe("system setting presentation", () => {
  it("uses friendly labels and detects common value types", () => {
    expect(humanizeSettingKey("maintenance.enabled")).toBe("Bật chế độ bảo trì");
    expect(humanizeSettingKey("feature.maxAttempts")).toBe("Feature max attempts");
    expect(getSystemSettingKind(true)).toBe("boolean");
    expect(getSystemSettingKind(12)).toBe("number");
    expect(getSystemSettingKind({ limit: 3 })).toBe("structured");
  });

  it("serializes and parses values without exposing structured syntax for common types", () => {
    expect(serializeSystemSetting(12)).toBe("12");
    expect(parseSystemSetting("boolean", "", false)).toBe(false);
    expect(parseSystemSetting("number", "12", false)).toBe(12);
    expect(parseSystemSetting("text", "  hello  ", false)).toBe("hello");
    expect(parseSystemSetting("structured", '{"limit":3}', false)).toEqual({ limit: 3 });
  });

  it("explains invalid advanced content", () => {
    expect(() => parseSystemSetting("structured", "{invalid", false)).toThrow(/chưa đúng cấu trúc/i);
  });
});
