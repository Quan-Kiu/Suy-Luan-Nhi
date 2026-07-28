"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { rolesApi } from "@/api/admin/roles";
import { permissionDefinitions, type PermissionGroup } from "@/auth/permissions";
import { FormStatus, SubmitButton, TextareaField, TextField } from "@/components/form";
import {
  createAccessRoleSchema,
  customRolePermissionKeys,
  updateAccessRoleSchema,
} from "@/domain/access-roles";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { createSlug } from "@/lib/slug";

const groupLabels: Record<PermissionGroup, string> = {
  family: "Gia đình",
  content: "Nội dung",
  operations: "Vận hành",
  security: "Bảo mật & quyền",
};

type FormValues = z.infer<typeof createAccessRoleSchema>;

function createRoleKey(value: string) {
  return createSlug(value).replaceAll("-", "_");
}

export function RoleForm({ mode, initial }: { mode: "create" | "edit"; initial: FormValues }) {
  const navigation = usePendingRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(createAccessRoleSchema), defaultValues: initial });
  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      mode === "create"
        ? rolesApi.create(values)
        : rolesApi.update(initial.key, updateAccessRoleSchema.parse(values)),
    onSuccess: () => {
      toast.success(mode === "create" ? "Đã thêm role" : "Đã cập nhật role");
      if (mode === "create") form.reset({ key: "", name: "", description: "", permissions: [] });
      navigation.refresh();
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
      <div className="grid gap-3 md:grid-cols-2">
        <TextField
          id={`role-${initial.key || "new"}-name`}
          label="Tên role"
          placeholder="Ví dụ: Quản lý vận hành"
          registration={form.register("name", {
            onChange: (event) => {
              if (mode === "create" && !form.formState.dirtyFields.key) {
                form.setValue("key", createRoleKey(event.target.value), { shouldValidate: true });
              }
            },
          })}
          error={form.formState.errors.name?.message}
        />
        <TextField
          id={`role-${initial.key || "new"}-key`}
          label="Mã role"
          placeholder="quan_ly_van_hanh"
          description={
            mode === "create" ? "Dùng nội bộ và không thể đổi sau khi tạo." : "Mã role không thể thay đổi."
          }
          registration={form.register("key")}
          disabled={mode === "edit"}
          error={form.formState.errors.key?.message}
        />
      </div>
      <TextareaField
        id={`role-${initial.key || "new"}-description`}
        label="Mô tả phạm vi trách nhiệm"
        placeholder="Nêu rõ role này dùng cho ai và được phép làm gì."
        rows={3}
        registration={form.register("description")}
        error={form.formState.errors.description?.message}
      />
      <fieldset className="rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4">
        <legend className="type-card-title px-1">Quyền được cấp</legend>
        <p className="type-supporting mt-1 text-[#6f6558]">
          Chỉ chọn các quyền cần thiết. Quyền xem tổng quan quản trị và các quyền xem phụ thuộc được tự động
          bổ sung để role mở đúng khu vực được quản lý.
        </p>
        <div className="mt-4 grid gap-5 xl:grid-cols-2">
          {(Object.keys(groupLabels) as PermissionGroup[]).map((group) => {
            const items = permissionDefinitions.filter(
              (permission) =>
                permission.group === group &&
                permission.key !== "admin.dashboard.view" &&
                customRolePermissionKeys.includes(permission.key),
            );
            if (!items.length) return null;
            return (
              <section key={group}>
                <h3 className="type-card-title text-[#5e554a]">{groupLabels[group]}</h3>
                <div className="mt-2 space-y-2">
                  {items.map((permission) => (
                    <label
                      key={permission.key}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3"
                    >
                      <input
                        type="checkbox"
                        value={permission.key}
                        {...form.register("permissions")}
                        className="mt-0.5 size-5 shrink-0 accent-[#e9641a]"
                      />
                      <span className="min-w-0">
                        <span className="type-label block text-[#3f392f]">{permission.label}</span>
                        <span className="type-caption mt-1 block text-[#786d60]">
                          {permission.description}
                        </span>
                        <span className="type-caption mt-1 block font-mono break-words text-[#8a5a32]">
                          {permission.routes.join(" · ")}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        {form.formState.errors.permissions?.message ? (
          <p role="alert" className="type-supporting mt-3 font-bold text-red-700">
            {form.formState.errors.permissions.message}
          </p>
        ) : null}
      </fieldset>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending || navigation.isPending}
        pendingLabel="Đang lưu..."
        className="w-auto"
      >
        {mode === "create" ? "Thêm role" : "Lưu thay đổi"}
      </SubmitButton>
    </form>
  );
}
