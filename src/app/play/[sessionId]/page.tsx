import { notFound } from "next/navigation";
import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { requireParent } from "@/auth/session";
import { SessionPlayer } from "@/features/gameplay/session-player";
import { getSessionView } from "@/modules/gameplay/session";
export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const session = await requireParent();
  const { sessionId } = await params;
  const view = await getSessionView(session.user.id, sessionId);
  if ("error" in view) notFound();
  return (
    <ChildShell>
      <BrandHeader backHref="/missions" compact sound />
      <SessionPlayer initialView={view} />
    </ChildShell>
  );
}
