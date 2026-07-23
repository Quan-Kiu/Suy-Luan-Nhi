import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveOperationalSystemSettings } from "@/domain/system-settings";

const mocks = vi.hoisted(() => ({
  getOperationalSystemSettings: vi.fn(),
}));

vi.mock("@/modules/system-settings/runtime", () => ({
  getOperationalSystemSettings: mocks.getOperationalSystemSettings,
}));

import { proxy } from "@/proxy";

function settings(overrides: Array<{ key: string; value: unknown }> = []) {
  return resolveOperationalSystemSettings(overrides);
}

function request(pathname: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(`http://localhost:3000${pathname}`, init);
}

describe("proxy system settings", () => {
  beforeEach(() => {
    mocks.getOperationalSystemSettings.mockReset();
    mocks.getOperationalSystemSettings.mockResolvedValue(settings());
  });

  it("redirects public pages and rejects public APIs during maintenance", async () => {
    mocks.getOperationalSystemSettings.mockResolvedValue(
      settings([{ key: "maintenance.enabled", value: true }]),
    );

    const pageResponse = await proxy(request("/missions"));
    const apiResponse = await proxy(request("/api/feedback"));

    expect(pageResponse.status).toBe(307);
    expect(pageResponse.headers.get("location")).toContain("/maintenance?from=%2Fmissions");
    expect(apiResponse.status).toBe(503);
    await expect(apiResponse.json()).resolves.toMatchObject({
      success: false,
      error: { code: "MAINTENANCE_MODE" },
    });
  });

  it("keeps auth and admin entry routes available during maintenance", async () => {
    mocks.getOperationalSystemSettings.mockResolvedValue(
      settings([{ key: "maintenance.enabled", value: true }]),
    );

    const signInResponse = await proxy(request("/auth/sign-in"));
    const adminResponse = await proxy(request("/admin"));

    expect(signInResponse.headers.get("x-middleware-next")).toBe("1");
    expect(adminResponse.headers.get("location")).toContain("/auth/sign-in");
    expect(adminResponse.headers.get("location")).not.toContain("/maintenance");
  });

  it("blocks new account creation when registration is disabled", async () => {
    mocks.getOperationalSystemSettings.mockResolvedValue(
      settings([{ key: "features.registrationEnabled", value: false }]),
    );

    const response = await proxy(request("/api/auth/sign-up/email", { method: "POST" }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "REGISTRATION_DISABLED" },
    });
  });

  it("blocks Google account creation when registration is disabled", async () => {
    mocks.getOperationalSystemSettings.mockResolvedValue(
      settings([{ key: "features.registrationEnabled", value: false }]),
    );

    const response = await proxy(
      request("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: "google", requestSignUp: true }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "REGISTRATION_DISABLED" },
    });
  });

  it("allows existing Google accounts to sign in when registration is disabled", async () => {
    mocks.getOperationalSystemSettings.mockResolvedValue(
      settings([{ key: "features.registrationEnabled", value: false }]),
    );

    const response = await proxy(
      request("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: "google", requestSignUp: false }),
      }),
    );

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
