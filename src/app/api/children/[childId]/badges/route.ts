import { requireApiRoles } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { getChildBadgeCollection } from "@/modules/family/child-badges";
import { getOwnedChild } from "@/modules/family/family";

export async function GET(request: Request, { params }: { params: Promise<{ childId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;

  const { childId } = await params;
  const owned = await getOwnedChild(authResult.session.user.id, childId);
  if (!owned) return apiJson({ message: "Không tìm thấy hồ sơ bé" }, { status: 404 });

  const items = await getChildBadgeCollection(owned.child.id);
  return apiJson(
    {
      child: {
        id: owned.child.id,
        displayName: owned.child.displayName,
        avatarUrl: owned.child.avatarUrl,
      },
      items: items.map((item) => ({
        ...item,
        unlockedAt: item.unlockedAt?.toISOString() ?? null,
      })),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
