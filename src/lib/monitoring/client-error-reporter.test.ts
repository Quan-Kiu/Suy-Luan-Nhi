import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addErrorBreadcrumb,
  reportApiFailure,
  reportClientError,
  setClientErrorReportingConsent,
} from "@/lib/monitoring/client-error-reporter";

const runtimeKey = "__slnAutomaticErrorReportingRuntime";

function resetRuntime() {
  delete (globalThis as typeof globalThis & Record<string, unknown>)[runtimeKey];
}

beforeEach(() => {
  resetRuntime();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 201 })),
  );
  window.history.replaceState({}, "", "/parent/settings?private=value");
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetRuntime();
});

describe("client error reporter", () => {
  it("does not send anything while consent is disabled", async () => {
    setClientErrorReportingConsent(false);
    reportClientError(new Error("boom"));
    await Promise.resolve();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends a redacted report with recent breadcrumbs after opt-in", async () => {
    setClientErrorReportingConsent(true);
    addErrorBreadcrumb("interaction", "click", {
      element: "button",
      email: "parent@example.com",
    });
    reportClientError(new Error("Failed for child@example.com at https://example.test/x?secret=yes"));

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [, options] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(String(options?.body));

    expect(payload.pagePath).toBe("/parent/settings");
    expect(payload.error.message).not.toContain("child@example.com");
    expect(payload.error.message).not.toContain("secret=yes");
    expect(payload.breadcrumbs[0].data.email).toBe("[redacted-email]");
  });

  it("does not retain actions collected while consent is denied", async () => {
    setClientErrorReportingConsent(false);
    addErrorBreadcrumb("interaction", "click", { element: "button", monitorAction: "private-old-action" });

    setClientErrorReportingConsent(true);
    reportClientError(new Error("boom"));

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [, options] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(String(options?.body));
    expect(payload.breadcrumbs).toEqual([]);
    expect(payload).not.toHaveProperty("pageTitle");
  });

  it("reports server and network failures but ignores expected client errors", async () => {
    setClientErrorReportingConsent(true);
    reportApiFailure({ url: "/api/children", status: 400 });
    await Promise.resolve();
    expect(fetch).not.toHaveBeenCalled();

    reportApiFailure({
      method: "post",
      url: "/api/children?name=private",
      status: 500,
      requestId: "req-123",
    });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const [, options] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(String(options?.body));
    expect(payload.source).toBe("api_failure");
    expect(payload.error.details.path).toBe("/api/children");
    expect(payload.error.details.status).toBe(500);
  });
});
