import { AdminShell } from "@/features/admin/admin-shell";
import { requirePermission } from "@/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePermission("admin.dashboard.view");
  return (
    <AdminShell userName={session.user.name} role={String(session.user.role ?? "staff")}>
      {children}
    </AdminShell>
  );
}
