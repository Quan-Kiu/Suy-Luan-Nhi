import { CheckCircle2, Route } from "lucide-react";
import { getPermissionDefinition, type PermissionGroup, type PermissionKey } from "@/auth/permissions";

const groupLabels: Record<PermissionGroup, string> = {
  family: "Gia đình",
  content: "Nội dung",
  operations: "Vận hành",
  security: "Bảo mật & quyền",
};

export function RolePermissionSummary({ permissions }: { permissions: readonly PermissionKey[] }) {
  const definitions = permissions.map(getPermissionDefinition);
  const grouped = Object.entries(
    definitions.reduce<Partial<Record<PermissionGroup, typeof definitions>>>((result, permission) => {
      result[permission.group] ??= [];
      result[permission.group]!.push(permission);
      return result;
    }, {}),
  ) as Array<[PermissionGroup, typeof definitions]>;

  return (
    <div className="space-y-5">
      {grouped.map(([group, items]) => (
        <section key={group}>
          <h4 className="type-label text-[#5e554a]">{groupLabels[group]}</h4>
          <div className="mt-2 space-y-3">
            {items.map((permission) => (
              <div key={permission.key} className="rounded-2xl border border-[#eee5d8] p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
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
  );
}
