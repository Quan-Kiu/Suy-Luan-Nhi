export class MemberPolicyError extends Error {
  constructor(
    public readonly code: "SELF_ROLE_CHANGE" | "SELF_BAN" | "LAST_SUPER_ADMIN",
    message: string,
  ) {
    super(message);
    this.name = "MemberPolicyError";
  }
}

export type MemberPolicyInput = {
  actorId: string;
  userId: string;
  currentRole: string;
  currentBanned: boolean;
  nextRole: string;
  nextBanned: boolean;
  roleWasProvided: boolean;
  banWasRequested: boolean;
  activeSuperAdminCount?: number;
};

export function assertMemberUpdatePolicy(input: MemberPolicyInput) {
  if (input.actorId === input.userId && input.roleWasProvided && input.nextRole !== input.currentRole) {
    throw new MemberPolicyError(
      "SELF_ROLE_CHANGE",
      "Không thể tự thay đổi vai trò của tài khoản đang sử dụng",
    );
  }
  if (input.actorId === input.userId && input.banWasRequested) {
    throw new MemberPolicyError("SELF_BAN", "Không thể tự khóa tài khoản đang sử dụng");
  }
  const removesActiveSuperAdmin =
    input.currentRole === "super_admin" &&
    !input.currentBanned &&
    (input.nextRole !== "super_admin" || input.nextBanned);
  if (
    removesActiveSuperAdmin &&
    input.activeSuperAdminCount !== undefined &&
    input.activeSuperAdminCount <= 1
  ) {
    throw new MemberPolicyError(
      "LAST_SUPER_ADMIN",
      "Hệ thống phải luôn còn ít nhất một super admin đang hoạt động",
    );
  }
}
