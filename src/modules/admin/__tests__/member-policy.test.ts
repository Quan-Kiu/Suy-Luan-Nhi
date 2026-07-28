import { describe, expect, it } from "vitest";
import {
  assertMemberPermanentDeletePolicy,
  assertMemberRestorePolicy,
  assertMemberTrashPolicy,
  assertMemberUpdatePolicy,
  MemberPolicyError,
} from "@/modules/admin/member-policy";

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

  it("blocks switching the current account between custom roles", () => {
    expectPolicyCode(
      () =>
        assertMemberUpdatePolicy({
          ...base,
          actorId: "same",
          userId: "same",
          currentRole: "custom_staff",
          currentRoleKey: "operations_manager",
          nextRole: "custom_staff",
          nextRoleKey: "support_manager",
          roleWasProvided: true,
        }),
      "SELF_ROLE_CHANGE",
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

  it("protects account trash and permanent deletion invariants", () => {
    expectPolicyCode(
      () =>
        assertMemberTrashPolicy({
          actorId: "same",
          userId: "same",
          currentRole: "parent",
          currentBanned: false,
          currentDeletedAt: null,
        }),
      "SELF_TRASH",
    );
    expectPolicyCode(
      () =>
        assertMemberTrashPolicy({
          actorId: "actor",
          userId: "target",
          currentRole: "super_admin",
          currentBanned: false,
          currentDeletedAt: null,
          activeSuperAdminCount: 1,
        }),
      "LAST_SUPER_ADMIN",
    );
    expectPolicyCode(
      () => assertMemberPermanentDeletePolicy({ actorId: "actor", userId: "target", currentDeletedAt: null }),
      "MEMBER_NOT_IN_TRASH",
    );
    expect(() => assertMemberRestorePolicy({ currentDeletedAt: new Date() })).not.toThrow();
  });
});
