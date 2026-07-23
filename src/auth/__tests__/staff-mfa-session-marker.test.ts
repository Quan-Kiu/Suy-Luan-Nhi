import { describe, expect, it, vi } from "vitest";
import { markSessionMfaVerified } from "@/auth/staff-mfa-session-marker";

describe("staff MFA session marker", () => {
  it("marks the session after a successful second-factor verification", async () => {
    const authSession = {
      session: { token: "session-token", mfaVerifiedAt: null },
    };
    const verifiedAt = new Date("2026-07-23T09:15:00.000Z");
    const updateSession = vi.fn().mockResolvedValue({ token: "session-token" });

    await expect(markSessionMfaVerified(authSession, updateSession, verifiedAt)).resolves.toBe(true);
    expect(updateSession).toHaveBeenCalledWith("session-token", { mfaVerifiedAt: verifiedAt });
    expect(authSession.session.mfaVerifiedAt).toEqual(verifiedAt);
  });

  it("does nothing when verification did not create or load a session", async () => {
    const updateSession = vi.fn();

    await expect(markSessionMfaVerified(null, updateSession)).resolves.toBe(false);
    expect(updateSession).not.toHaveBeenCalled();
  });
});
