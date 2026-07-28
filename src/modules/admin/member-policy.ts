export class MemberPolicyError extends Error {
  constructor(
    public readonly code:
      | "SELF_ROLE_CHANGE"
      | "SELF_BAN"
      | "SELF_TRASH"
      | "SELF_PERMANENT_DELETE"
      | "LAST_SUPER_ADMIN"
      | "MEMBER_IN_TRASH"
      | "MEMBER_NOT_IN_TRASH",
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
  currentDeletedAt?: Date | null;
  currentRoleKey?: string;
  nextRole: string;
  nextRoleKey?: string;
  nextBanned: boolean;
  roleWasProvided: boolean;
  banWasRequested: boolean;
  activeSuperAdminCount?: number;
};

function assertLastActiveSuperAdmin(input: {
  currentRole: string;
  currentBanned: boolean;
  currentDeletedAt?: Date | null;
  removesAccess: boolean;
  activeSuperAdminCount?: number;
}) {
  const removesActiveSuperAdmin =
    input.currentRole === "super_admin" &&
    !input.currentBanned &&
    !input.currentDeletedAt &&
    input.removesAccess;
  if (
    removesActiveSuperAdmin &&
    input.activeSuperAdminCount !== undefined &&
    input.activeSuperAdminCount <= 1
  ) {
    throw new MemberPolicyError(
      "LAST_SUPER_ADMIN",
      "Hệ thống phải luôn còn ít nhất một quản trị viên đang hoạt động",
    );
  }
}

export function assertMemberUpdatePolicy(input: MemberPolicyInput) {
  if (input.currentDeletedAt) {
    throw new MemberPolicyError(
      "MEMBER_IN_TRASH",
      "Tài khoản đang ở trong thùng rác. Hãy khôi phục trước khi thay đổi quyền.",
    );
  }
  const currentRoleIdentity = input.currentRoleKey ?? input.currentRole;
  const nextRoleIdentity = input.nextRoleKey ?? input.nextRole;
  if (input.actorId === input.userId && input.roleWasProvided && nextRoleIdentity !== currentRoleIdentity) {
    throw new MemberPolicyError(
      "SELF_ROLE_CHANGE",
      "Không thể tự thay đổi vai trò của tài khoản đang sử dụng",
    );
  }
  if (input.actorId === input.userId && input.banWasRequested) {
    throw new MemberPolicyError("SELF_BAN", "Không thể tự khóa tài khoản đang sử dụng");
  }
  assertLastActiveSuperAdmin({
    ...input,
    removesAccess: input.nextRole !== "super_admin" || input.nextBanned,
  });
}

export function assertMemberTrashPolicy(input: {
  actorId: string;
  userId: string;
  currentRole: string;
  currentBanned: boolean;
  currentDeletedAt: Date | null;
  activeSuperAdminCount?: number;
}) {
  if (input.currentDeletedAt) {
    throw new MemberPolicyError("MEMBER_IN_TRASH", "Tài khoản đã ở trong thùng rác");
  }
  if (input.actorId === input.userId) {
    throw new MemberPolicyError("SELF_TRASH", "Không thể đưa tài khoản đang sử dụng vào thùng rác");
  }
  assertLastActiveSuperAdmin({ ...input, removesAccess: true });
}

export function assertMemberRestorePolicy(input: { currentDeletedAt: Date | null }) {
  if (!input.currentDeletedAt) {
    throw new MemberPolicyError("MEMBER_NOT_IN_TRASH", "Tài khoản không nằm trong thùng rác");
  }
}

export function assertMemberPermanentDeletePolicy(input: {
  actorId: string;
  userId: string;
  currentDeletedAt: Date | null;
}) {
  if (input.actorId === input.userId) {
    throw new MemberPolicyError("SELF_PERMANENT_DELETE", "Không thể xóa vĩnh viễn tài khoản đang sử dụng");
  }
  if (!input.currentDeletedAt) {
    throw new MemberPolicyError(
      "MEMBER_NOT_IN_TRASH",
      "Chỉ có thể xóa vĩnh viễn tài khoản đang ở trong thùng rác",
    );
  }
}
