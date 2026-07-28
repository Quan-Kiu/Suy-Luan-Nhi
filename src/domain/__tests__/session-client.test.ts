import { describe, expect, it } from "vitest";
import { normalizeSessionIpAddress, parseSessionClient } from "@/domain/session-client";

describe("session client presentation", () => {
  it("recognizes common desktop and mobile clients", () => {
    expect(
      parseSessionClient(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36",
      ),
    ).toEqual({ browser: "Chrome", operatingSystem: "Windows", deviceType: "desktop" });

    expect(
      parseSessionClient(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
      ),
    ).toEqual({ browser: "Safari", operatingSystem: "iOS", deviceType: "mobile" });
  });

  it("uses safe fallbacks and normalizes IPv4-mapped addresses", () => {
    expect(parseSessionClient(null)).toEqual({
      browser: "Trình duyệt chưa xác định",
      operatingSystem: "Hệ điều hành chưa xác định",
      deviceType: "unknown",
    });
    expect(normalizeSessionIpAddress("::ffff:127.0.0.1")).toBe("127.0.0.1");
    expect(normalizeSessionIpAddress(" ")).toBeNull();
  });
});
