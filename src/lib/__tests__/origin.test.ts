import { afterEach, describe, expect, it, vi } from "vitest";
import { isTrustedRequestOrigin } from "@/lib/origin";

afterEach(() => vi.unstubAllEnvs());

describe("isTrustedRequestOrigin", () => {
  it("accepts localhost on a different development port", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(
      isTrustedRequestOrigin({
        origin: "http://localhost:3001",
        requestOrigin: "http://0.0.0.0:3001",
        host: "localhost:3001",
        forwardedHost: null,
        forwardedProto: null,
      }),
    ).toBe(true);
  });
  it("rejects an unconfigured production origin", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_URL", "https://app.example.com");
    vi.stubEnv("BETTER_AUTH_TRUSTED_ORIGINS", "https://admin.example.com");
    expect(
      isTrustedRequestOrigin({
        origin: "https://attacker.example",
        requestOrigin: "http://internal:3000",
        host: "internal:3000",
        forwardedHost: "app.example.com",
        forwardedProto: "https",
      }),
    ).toBe(false);
  });

  it("accepts a configured production origin pattern", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_TRUSTED_ORIGINS", "https://*.example.com");
    expect(
      isTrustedRequestOrigin({
        origin: "https://admin.example.com",
        requestOrigin: "http://internal:3000",
        host: "internal:3000",
        forwardedHost: null,
        forwardedProto: null,
      }),
    ).toBe(true);
  });
});
