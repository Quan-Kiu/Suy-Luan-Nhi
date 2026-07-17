import type { ReactNode } from "react";
import { Card } from "@/components/ui";

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </Card>
  );
}
