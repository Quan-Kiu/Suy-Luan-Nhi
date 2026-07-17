import type { ContentDictionary } from "@/content/types";
import { ParentHeader } from "@/features/parent/parent-header";
import { ParentNav } from "@/features/parent/parent-nav";

export function ParentShell({
  children,
  childName,
  unread = 0,
  content,
}: {
  children: React.ReactNode;
  childName: string;
  unread?: number;
  content: ContentDictionary;
}) {
  return (
    <div className="min-h-screen bg-[#f2eadc]">
      <ParentHeader childName={childName} unread={unread} content={content} />
      <ParentNav unread={unread} />
      <main className="mx-auto max-w-6xl px-5 py-6 pb-24 sm:pb-10">{children}</main>
    </div>
  );
}
