import { z } from "zod";
import { permissionKeys } from "@/auth/permissions";

export const accessRoleKeySchema = z
  .string()
  .trim()
  .min(3, "Mã role cần ít nhất 3 ký tự")
  .max(50, "Mã role tối đa 50 ký tự")
  .regex(/^[a-z][a-z0-9_]*$/, "Mã role bắt đầu bằng chữ thường và chỉ gồm chữ, số, dấu gạch dưới");

export const customRolePermissionKeys = permissionKeys.filter(
  (permission) => !permission.startsWith("family."),
);

const customRolePermissionSchema = z
  .enum(permissionKeys)
  .refine(
    (permission) => customRolePermissionKeys.includes(permission),
    "Role nhân sự không thể nhận quyền dành riêng cho gia đình",
  );

const sharedFields = {
  name: z.string().trim().min(2, "Tên role cần ít nhất 2 ký tự").max(80, "Tên role tối đa 80 ký tự"),
  description: z.string().trim().min(8, "Mô tả cần ít nhất 8 ký tự").max(500, "Mô tả tối đa 500 ký tự"),
  permissions: z.array(customRolePermissionSchema).min(1, "Hãy chọn ít nhất một quyền"),
};

export const createAccessRoleSchema = z.object({ key: accessRoleKeySchema, ...sharedFields });
export const updateAccessRoleSchema = z.object(sharedFields);

export type CreateAccessRoleInput = z.infer<typeof createAccessRoleSchema>;
export type UpdateAccessRoleInput = z.infer<typeof updateAccessRoleSchema>;
