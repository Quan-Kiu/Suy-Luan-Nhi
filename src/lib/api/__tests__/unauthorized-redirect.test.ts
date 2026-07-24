import { describe, expect, it, vi } from "vitest";
import {
  buildUnauthorizedSignInPath,
  createUnauthorizedRedirectHandler,
} from "@/lib/api/unauthorized-redirect";

const protectedLocation = {
  pathname: "/parent/notifications",
  search: "?filter=unread",
  hash: "#latest",
};

describe("unauthorized API redirect", () => {
  it("preserves the protected page when a session expires", () => {
    expect(buildUnauthorizedSignInPath(401, protectedLocation)).toBe(
      "/auth/sign-in?callbackUrl=%2Fparent%2Fnotifications%3Ffilter%3Dunread%23latest",
    );
  });

  it.each([undefined, 400, 403, 500])("does not redirect for status %s", (status) => {
    expect(buildUnauthorizedSignInPath(status, protectedLocation)).toBeNull();
  });

  it.each(["/auth", "/auth/sign-in", "/auth/forgot-password", "/auth/two-factor"])(
    "avoids redirect loops from %s",
    (pathname) => {
      expect(buildUnauthorizedSignInPath(401, { pathname, search: "", hash: "" })).toBeNull();
    },
  );

  it("starts only one hard navigation when concurrent requests return 401", () => {
    const replace = vi.fn();
    const redirect = createUnauthorizedRedirectHandler();
    const runtime = { location: protectedLocation, replace };

    expect(redirect(401, runtime)).toBe(true);
    expect(redirect(401, runtime)).toBe(false);
    expect(replace).toHaveBeenCalledOnce();
  });

  it("does nothing during server rendering", () => {
    const redirect = createUnauthorizedRedirectHandler();
    expect(redirect(401, null)).toBe(false);
  });
});
