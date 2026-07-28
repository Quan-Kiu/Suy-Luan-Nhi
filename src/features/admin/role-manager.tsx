"use client";

import { useMutation } from "@tanstack/react-query";
import { ChevronDown, LockKeyhole, Plus, Trash2, UserRoundCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { rolesApi } from "@/api/admin/roles";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RoleForm } from "@/features/admin/role-form";
import { RolePermissionSummary } from "@/features/admin/role-permission-summary";
import { usePendingRouter } from "@/hooks/use-pending-router";
import type { AccessRoleItem } from "@/modules/admin/access-roles";

function CustomRoleCard({ role, canManage }: { role: AccessRoleItem; canManage: boolean }) {
  const navigation = usePendingRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutation = useMutation({
    mutationFn: () => rolesApi.delete(role.key),
    onSuccess: () => {
      toast.success("Đã xóa role");
      setConfirmOpen(false);
      navigation.refresh();
    },
  });
  return (
    <details className="group overflow-hidden rounded-2xl border bg-white shadow-sm">
      <summary className="flex min-h-20 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#fff0df] text-[#b9470d]">
          <UserRoundCog size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="type-card-title">{role.name}</h3>
            <code className="type-caption rounded-full bg-[#f0ebe2] px-2.5 py-1 font-bold text-[#6f6558]">
              {role.key}
            </code>
          </div>
          <p className="type-supporting mt-1 line-clamp-2 text-[#6f6558]">{role.description}</p>
          <p className="type-caption mt-1 font-bold text-[#9f3d0b]">
            {role.permissions.length} quyền · {role.memberCount} thành viên
          </p>
        </div>
        <ChevronDown size={19} className="shrink-0 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-[#eadfc9] p-4">
        {canManage ? (
          <RoleForm
            mode="edit"
            initial={{
              key: role.key,
              name: role.name,
              description: role.description,
              permissions: role.permissions,
            }}
          />
        ) : (
          <RolePermissionSummary permissions={role.permissions} />
        )}
        {canManage ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={role.memberCount > 0}
            className="type-action inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-red-700 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Trash2 size={16} /> Xóa role
          </button>
        ) : null}
        {canManage && role.memberCount > 0 ? (
          <p className="type-caption font-bold text-amber-700">
            Cần chuyển {role.memberCount} thành viên sang role khác trước khi xóa.
          </p>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={`Xóa role ${role.name}?`}
        description="Role sẽ bị xóa vĩnh viễn. Thao tác chỉ được phép khi không còn thành viên nào đang sử dụng role này."
        confirmLabel="Xóa role"
        tone="danger"
        pending={mutation.isPending || navigation.isPending}
        errorMessage={mutation.error?.message}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => mutation.mutate()}
      />
    </details>
  );
}

export function RoleManager({ roles, canManage }: { roles: AccessRoleItem[]; canManage: boolean }) {
  const systemRoles = roles.filter((role) => role.system);
  const customRoles = roles.filter((role) => !role.system);
  return (
    <div className="space-y-6">
      {canManage ? (
        <details className="group overflow-hidden rounded-2xl border-2 border-dashed border-[#d9c9ae] bg-[#fffaf0]">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#fff0df] text-[#b9470d]">
                <Plus size={19} />
              </span>
              <div>
                <h2 className="type-card-title">Thêm role tùy chỉnh</h2>
                <p className="type-supporting mt-0.5 text-[#6f6558]">
                  Tạo một tập quyền riêng để gán cho nhóm nhân sự cụ thể.
                </p>
              </div>
            </div>
            <ChevronDown size={19} className="transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-[#eadfc9] p-4">
            <RoleForm mode="create" initial={{ key: "", name: "", description: "", permissions: [] }} />
          </div>
        </details>
      ) : null}

      <section aria-labelledby="custom-roles-title">
        <div className="mb-3">
          <h2 id="custom-roles-title" className="type-section-title">
            Role tùy chỉnh
          </h2>
          <p className="type-supporting mt-1 text-[#6f6558]">
            Có {customRoles.length} role tùy chỉnh có thể gán cho thành viên.
          </p>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {customRoles.map((role) => (
            <CustomRoleCard key={role.key} role={role} canManage={canManage} />
          ))}
        </div>
        {!customRoles.length ? (
          <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-[#6f6558]">
            Chưa có role tùy chỉnh.
          </div>
        ) : null}
      </section>

      <section aria-labelledby="system-roles-title">
        <div className="mb-3">
          <h2 id="system-roles-title" className="type-section-title">
            Role hệ thống
          </h2>
          <p className="type-supporting mt-1 text-[#6f6558]">
            Các role lõi được khóa để bảo vệ luồng gia đình và quyền quản trị cao nhất.
          </p>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {systemRoles.map((role) => (
            <details key={role.key} className="group overflow-hidden rounded-2xl border bg-white shadow-sm">
              <summary className="flex min-h-20 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf4df] text-[#587048]">
                  <LockKeyhole size={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="type-card-title">{role.name}</h3>
                    <span className="type-caption rounded-full bg-[#edf4df] px-2.5 py-1 font-bold text-[#587048]">
                      Hệ thống
                    </span>
                    <code className="type-caption rounded-full bg-[#f0ebe2] px-2.5 py-1 font-bold text-[#6f6558]">
                      {role.key}
                    </code>
                  </div>
                  <p className="type-supporting mt-1 text-[#6f6558]">{role.description}</p>
                  <p className="type-caption mt-1 font-bold text-[#9f3d0b]">
                    {role.permissions.length} quyền · {role.memberCount} thành viên
                  </p>
                </div>
                <ChevronDown size={19} className="shrink-0 transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-[#eadfc9] p-4">
                <RolePermissionSummary permissions={role.permissions} />
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
