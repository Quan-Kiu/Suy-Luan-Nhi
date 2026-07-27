import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getApiSession: vi.fn(),
  findParent: vi.fn(),
  consumeRateLimit: vi.fn(),
  createOrAggregateAutomaticFeedback: vi.fn(),
}));

vi.mock("@/auth/api", () => ({ getApiSession: mocks.getApiSession }));
vi.mock("@/db/client", () => ({
  db: {
    query: {
      parentProfiles: {
        findFirst: mocks.findParent,
      },
    },
  },
}));
vi.mock("@/modules/system-feedback/error-reporting-rate-limit", () => ({
  consumeAutomaticErrorReportRateLimit: mocks.consumeRateLimit,
}));
vi.mock("@/modules/system-feedback/system-feedback", () => ({
  createOrAggregateAutomaticFeedback: mocks.createOrAggregateAutomaticFeedback,
}));

import { GET, POST } from "@/app/api/error-reports/route";

const session = {
  user: { id: "user-1", name: "Parent", email: "parent@example.test" },
  session: { token: "session-token" },
};

function validReport() {
  return {
    source: "api_failure",
    pagePath: "/parent/settings",
    pageTitle: "Cài đặt gia đình",
    error: {
      name: "Error",
      message: "API PATCH /api/parent/settings thất bại",
      details: { status: 500, requestId: "req-123" },
    },
    breadcrumbs: [
      {
        timestamp: new Date().toISOString(),
        category: "interaction",
        action: "form.submit",
        data: { method: "POST" },
      },
    ],
    viewportWidth: 1280,
    viewportHeight: 720,
    devicePixelRatio: 1,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getApiSession.mockResolvedValue(session);
  mocks.findParent.mockResolvedValue({ privacySettings: { errorReporting: true } });
  mocks.consumeRateLimit.mockResolvedValue({ allowed: true, maxRequests: 20, windowMinutes: 10 });
  mocks.createOrAggregateAutomaticFeedback.mockResolvedValue({
    duplicate: false,
    reopened: false,
    item: { id: "feedback-1", occurrenceCount: 1 },
  });
});

describe("automatic error reports API", () => {
  it("returns disabled for unauthenticated visitors", async () => {
    mocks.getApiSession.mockResolvedValue(null);
    const response = await GET(new Request("https://example.test/api/error-reports"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.enabled).toBe(false);
    expect(mocks.findParent).not.toHaveBeenCalled();
  });

  it("rechecks consent server-side before accepting a report", async () => {
    mocks.findParent.mockResolvedValue({ privacySettings: { errorReporting: false } });
    const response = await POST(
      new Request("https://example.test/api/error-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validReport()),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("ERROR_REPORTING_DISABLED");
    expect(mocks.createOrAggregateAutomaticFeedback).not.toHaveBeenCalled();
  });

  it("stores an opted-in report in the developer feedback workflow", async () => {
    const response = await POST(
      new Request("https://example.test/api/error-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "Test Browser 1.0" },
        body: JSON.stringify(validReport()),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toEqual({
      id: "feedback-1",
      accepted: true,
      duplicate: false,
      reopened: false,
      occurrenceCount: 1,
    });
    expect(mocks.createOrAggregateAutomaticFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        pagePath: "/parent/settings",
        fingerprint: expect.stringMatching(/^[a-f0-9]{32}$/),
        context: expect.objectContaining({
          reportKind: "automatic_error",
          source: "api_failure",
          breadcrumbs: expect.any(Array),
          userAgent: "Test Browser 1.0",
        }),
      }),
    );
  });

  it("returns the existing feedback when the same fault is aggregated", async () => {
    mocks.createOrAggregateAutomaticFeedback.mockResolvedValue({
      duplicate: true,
      reopened: false,
      item: { id: "feedback-1", occurrenceCount: 7 },
    });
    const response = await POST(
      new Request("https://example.test/api/error-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validReport()),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({
      id: "feedback-1",
      accepted: true,
      duplicate: true,
      reopened: false,
      occurrenceCount: 7,
    });
  });
});
