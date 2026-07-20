import { describe, expect, it } from "vitest";
import { isNavigationPrefetch, shouldRelockParentGate } from "@/lib/navigation/parent-gate-relock";

describe("Parent Gate relock navigation", () => {
  it("ignores Next Router prefetch requests", () => {
    const headers = new Headers({ "next-router-prefetch": "1" });
    expect(isNavigationPrefetch(headers)).toBe(true);
    expect(shouldRelockParentGate({ pathname: "/missions", hasGateCookie: true, headers })).toBe(false);
  });

  it("keeps the gate open for parent and API requests", () => {
    expect(
      shouldRelockParentGate({ pathname: "/parent/settings", hasGateCookie: true, headers: new Headers() }),
    ).toBe(false);
    expect(
      shouldRelockParentGate({
        pathname: "/api/parent/settings",
        hasGateCookie: true,
        headers: new Headers(),
      }),
    ).toBe(false);
  });

  it("relocks only on a real navigation outside the parent area", () => {
    expect(
      shouldRelockParentGate({ pathname: "/missions", hasGateCookie: true, headers: new Headers() }),
    ).toBe(true);
    expect(
      shouldRelockParentGate({ pathname: "/missions", hasGateCookie: false, headers: new Headers() }),
    ).toBe(false);
  });
});
