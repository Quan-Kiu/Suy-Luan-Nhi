import { notFound } from "next/navigation";
import { requireParent } from "@/auth/session";
import { SessionPlayer } from "@/features/gameplay/session-player";
import { getSessionView } from "@/modules/gameplay/session";
export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const session = await requireParent();
  const { sessionId } = await params;
  const view = await getSessionView(session.user.id, sessionId);
  if ("error" in view) notFound();
  return <SessionPlayer initialView={view} />;
}
