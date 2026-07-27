import { resolveEffectiveAccess } from "@/auth/effective-access";
import { requirePermission } from "@/auth/session";
import { AdminShell } from "@/features/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePermission("admin.dashboard.view");
  const access = await resolveEffectiveAccess(session.user);
  return (
    <AdminShell
      userName={session.user.name}
      role={String(session.user.role ?? "staff")}
      roleLabel={access.roleLabel}
      permissions={access.permissions}
    >
      {children}
    </AdminShell>
  );
}
