import { describe, expect, it } from "vitest";
import type { AutomaticErrorReportInput } from "@/domain/error-reporting";
import { createAutomaticFeedbackFingerprint } from "@/modules/system-feedback/automatic-feedback";

function report(overrides: Partial<AutomaticErrorReportInput> = {}): AutomaticErrorReportInput {
  return {
    source: "api_failure",
    pagePath: "/parent/settings",
    error: {
      name: "Error",
      message: "API PATCH /api/parent/settings thất bại",
      details: {
        method: "PATCH",
        path: "/api/parent/settings",
        status: 500,
        code: "SERVER_ERROR",
        requestId: "request-a",
      },
    },
    breadcrumbs: [],
    ...overrides,
  };
}

describe("automatic feedback fingerprint", () => {
  it("ignores request IDs, breadcrumbs, source hooks, and viewport noise", () => {
    const first = report();
    const second = report({
      source: "unhandled_rejection",
      viewportWidth: 390,
      viewportHeight: 844,
      breadcrumbs: [
        {
          timestamp: "2026-07-27T10:00:00.000Z",
          category: "interaction",
          action: "click",
          data: {},
        },
      ],
      error: {
        ...first.error,
        details: { ...first.error.details, requestId: "request-b" },
      },
    });

    expect(createAutomaticFeedbackFingerprint(first)).toBe(createAutomaticFeedbackFingerprint(second));
  });

  it("separates faults from different pages or status codes", () => {
    const base = createAutomaticFeedbackFingerprint(report());
    expect(createAutomaticFeedbackFingerprint(report({ pagePath: "/profiles" }))).not.toBe(base);
    expect(
      createAutomaticFeedbackFingerprint(
        report({ error: { ...report().error, details: { ...report().error.details, status: 503 } } }),
      ),
    ).not.toBe(base);
    expect(createAutomaticFeedbackFingerprint(report())).toBe(base);
  });
});
