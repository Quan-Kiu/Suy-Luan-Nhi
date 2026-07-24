import type { ContentDictionary } from "@/content/types";
import { ParentHeader } from "@/features/parent/parent-header";
import { ParentNav } from "@/features/parent/parent-nav";

export function ParentShell({
  children,
  childName,
  unread = 0,
  content,
  resourcesEnabled = true,
  canAccessAdmin = false,
}: {
  children: React.ReactNode;
  childName: string;
  unread?: number;
  content: ContentDictionary;
  resourcesEnabled?: boolean;
  canAccessAdmin?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f2eadc]">
      <ParentHeader childName={childName} unread={unread} content={content} canAccessAdmin={canAccessAdmin} />
      <ParentNav unread={unread} resourcesEnabled={resourcesEnabled} />
      <main className="safe-area-page-with-bottom-nav mx-auto max-w-6xl px-5 py-6">{children}</main>
    </div>
  );
}
