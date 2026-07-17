import { cache } from "react";
import { cookies } from "next/headers";
import { requireParent } from "@/auth/session";
import { getOwnedChild, listChildren } from "@/modules/family/family";

export const getActiveChild = cache(async () => {
  const session = await requireParent();
  const selectedId = (await cookies()).get("sln_active_child")?.value;
  if (selectedId) {
    const owned = await getOwnedChild(session.user.id, selectedId);
    if (owned) return owned;
  }
  const children = await listChildren(session.user.id, session.user.name);
  const first = children[0];
  if (!first) return null;
  return {
    child: first,
    parent: await getOwnedChild(session.user.id, first.id).then((value) => value!.parent),
  };
});
