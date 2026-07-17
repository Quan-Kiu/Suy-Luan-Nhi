import { ChildShell } from "@/components/child-shell";
import { ChildHeader } from "@/features/child/child-header";

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChildShell>
      <ChildHeader />
      {children}
    </ChildShell>
  );
}
