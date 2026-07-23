import { describe, expect, it } from "vitest";
import { assertMemberUpdatePolicy, MemberPolicyError } from "@/modules/admin/member-policy";

const base = {
  actorId: "actor",
  userId: "target",
  currentRole: "super_admin",
  currentBanned: false,
  nextRole: "super_admin",
  nextBanned: false,
  roleWasProvided: false,
  banWasRequested: false,
};

function expectPolicyCode(run: () => void, code: MemberPolicyError["code"]) {
  try {
    run();
    throw new Error("Expected member policy error");
  } catch (error) {
    expect(error).toBeInstanceOf(MemberPolicyError);
    expect((error as MemberPolicyError).code).toBe(code);
  }
}

describe("member security policy", () => {
  it("blocks self-demotion and self-ban", () => {
    expectPolicyCode(
      () =>
        assertMemberUpdatePolicy({
          ...base,
          actorId: "same",
          userId: "same",
          nextRole: "reviewer",
          roleWasProvided: true,
        }),
      "SELF_ROLE_CHANGE",
    );
    expectPolicyCode(
      () =>
        assertMemberUpdatePolicy({
          ...base,
          actorId: "same",
          userId: "same",
          nextBanned: true,
          banWasRequested: true,
        }),
      "SELF_BAN",
    );
  });

  it("protects the final active super admin", () => {
    expectPolicyCode(
      () =>
        assertMemberUpdatePolicy({
          ...base,
          nextRole: "reviewer",
          roleWasProvided: true,
          activeSuperAdminCount: 1,
        }),
      "LAST_SUPER_ADMIN",
    );
    expectPolicyCode(
      () =>
        assertMemberUpdatePolicy({
          ...base,
          nextBanned: true,
          banWasRequested: true,
          activeSuperAdminCount: 1,
        }),
      "LAST_SUPER_ADMIN",
    );
  });

  it("allows removing one super admin when another remains", () => {
    expect(() =>
      assertMemberUpdatePolicy({
        ...base,
        nextRole: "reviewer",
        roleWasProvided: true,
        activeSuperAdminCount: 2,
      }),
    ).not.toThrow();
  });
});
