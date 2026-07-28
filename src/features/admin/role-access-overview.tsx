import { CheckCircle2, Route, ShieldCheck } from "lucide-react";
import {
  getPermissionDefinition,
  getPermissionsForRole,
  roleDefinitions,
  type PermissionGroup,
} from "@/auth/permissions";
import { systemRoleSchema } from "@/auth/roles";

const groupLabels: Record<PermissionGroup, string> = {
  family: "Gia đình",
  content: "Nội dung",
  operations: "Vận hành",
  security: "Bảo mật & quyền",
};

export function RoleAccessOverview() {
  return (
    <section aria-labelledby="role-access-title" className="space-y-4">
      <div className="rounded-2xl border border-[#e4d8c5] bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf4df] text-[#587048]">
            <ShieldCheck size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 id="role-access-title" className="type-section-title">
              Ma trận vai trò và quyền
            </h2>
            <p className="type-supporting mt-1 text-[#6f6558]">
              RBAC (phân quyền theo vai trò) dùng cùng một nguồn chính sách cho menu, trang và API. Ví dụ:
              người kiểm tra có thể duyệt nhiệm vụ nhưng không sửa bản nháp.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {systemRoleSchema.options.map((role) => {
          const definition = roleDefinitions[role];
          const permissions = getPermissionsForRole(role).map(getPermissionDefinition);
          const grouped = Object.entries(
            permissions.reduce<Partial<Record<PermissionGroup, typeof permissions>>>((result, permission) => {
              result[permission.group] ??= [];
              result[permission.group]!.push(permission);
              return result;
            }, {}),
          ) as Array<[PermissionGroup, typeof permissions]>;

          return (
            <article
              key={role}
              className="overflow-hidden rounded-3xl border border-[#e4d8c5] bg-white shadow-sm"
            >
              <header className="border-b border-[#eee5d8] bg-[#fffaf2] p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="type-card-title text-[#342f28]">{definition.label}</h3>
                  <code className="type-caption rounded-full bg-[#f0ebe2] px-2.5 py-1 font-bold text-[#6f6558]">
                    {role}
                  </code>
                </div>
                <p className="type-supporting mt-2 text-[#6f6558]">{definition.description}</p>
                <p className="type-caption mt-2 font-bold text-[#9f3d0b]">{permissions.length} quyền</p>
              </header>
              <div className="space-y-5 p-4 sm:p-5">
                {grouped.map(([group, items]) => (
                  <section key={group}>
                    <h4 className="type-label text-[#5e554a]">{groupLabels[group]}</h4>
                    <div className="mt-2 space-y-3">
                      {items.map((permission) => (
                        <div key={permission.key} className="rounded-2xl border border-[#eee5d8] p-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle2
                              className="mt-0.5 size-4 shrink-0 text-green-700"
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <p className="type-label text-[#3f392f]">{permission.label}</p>
                              <p className="type-caption mt-1 text-[#786d60]">{permission.description}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
                            {permission.routes.map((route) => (
                              <code
                                key={route}
                                className="type-caption inline-flex items-center gap-1 rounded-lg bg-[#f7f3eb] px-2 py-1 text-[#62594e]"
                              >
                                <Route size={12} aria-hidden="true" /> {route}
                              </code>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
