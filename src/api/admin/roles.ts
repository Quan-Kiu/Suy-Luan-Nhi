import type { PermissionKey } from "@/auth/permissions";
import { apiRequest } from "@/lib/api/client";
import type { AccessRoleItem } from "@/modules/admin/access-roles";

type AccessRoleResponse = Omit<AccessRoleItem, "createdAt" | "updatedAt"> & {
  createdAt: string | null;
  updatedAt: string | null;
};

export type AccessRoleInput = {
  key?: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
};

export const rolesApi = {
  create(input: AccessRoleInput & { key: string }) {
    return apiRequest<AccessRoleResponse>({ url: "/api/admin/roles", method: "POST", data: input });
  },
  update(key: string, input: AccessRoleInput) {
    return apiRequest<AccessRoleResponse>({ url: `/api/admin/roles/${key}`, method: "PATCH", data: input });
  },
  delete(key: string) {
    return apiRequest<{ key: string }>({ url: `/api/admin/roles/${key}`, method: "DELETE" });
  },
};
