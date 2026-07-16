import { ChildShell } from "@/components/child-shell";
import { ParentExperience } from "@/features/parent/parent-experience";
export default function ParentPage() {
  return (
    <ChildShell>
      <ParentExperience />
    </ChildShell>
  );
}
