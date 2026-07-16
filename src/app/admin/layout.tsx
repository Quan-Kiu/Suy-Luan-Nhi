import { AdminShell } from "@/features/admin/admin-shell";
import { requireStaff } from "@/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  return (
    <AdminShell userName={session.user.name} role={String(session.user.role ?? "staff")}>
      {children}
    </AdminShell>
  );
}
