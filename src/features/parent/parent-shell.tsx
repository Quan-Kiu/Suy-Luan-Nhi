import type { ContentDictionary } from "@/content/types";
import { ParentHeader } from "@/features/parent/parent-header";
import { ParentNav } from "@/features/parent/parent-nav";
import { ReleaseNotesAnnouncement } from "@/features/parent/release-notes-announcement";
import { getLatestPublishedReleaseNote } from "@/modules/release-notes/release-notes";

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
  const latestRelease = getLatestPublishedReleaseNote();

  return (
    <div className="min-h-screen bg-[#f2eadc]">
      <ParentHeader
        childName={childName}
        unread={unread}
        content={content}
        canAccessAdmin={canAccessAdmin}
        latestReleaseVersion={latestRelease?.version ?? null}
      />
      <ParentNav unread={unread} resourcesEnabled={resourcesEnabled} />
      <main className="safe-area-page-with-bottom-nav mx-auto max-w-6xl px-5 py-6">
        <ReleaseNotesAnnouncement release={latestRelease} />
        {children}
      </main>
    </div>
  );
}
