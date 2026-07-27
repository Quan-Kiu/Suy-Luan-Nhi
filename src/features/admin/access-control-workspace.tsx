"use client";

import { ShieldCheck, UsersRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminTabPanel, AdminTabs } from "@/features/admin/admin-tabs";
import { MemberManager } from "@/features/admin/member-manager";
import type { MemberItem } from "@/features/admin/member-row";
import { RoleManager } from "@/features/admin/role-manager";
import type { AccessRoleItem } from "@/modules/admin/access-roles";

type TabKey = "roles" | "members";

export function AccessControlWorkspace({
  initialTab,
  roles,
  members,
  trashedMembers,
  currentUserId,
  canManageRoles,
  canManageMembers,
}: {
  initialTab: TabKey;
  roles: AccessRoleItem[];
  members: MemberItem[];
  trashedMembers: MemberItem[];
  currentUserId: string;
  canManageRoles: boolean;
  canManageMembers: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const requested: TabKey = requestedTab === "members" ? "members" : "roles";
  const tab: TabKey =
    requested === "members" && !canManageMembers ? "roles" : requestedTab ? requested : initialTab;
  const changeTab = (next: TabKey) => {
    router.replace(`/admin/access-control?tab=${next}`, { scroll: false });
  };
  return (
    <div className="space-y-4">
      <AdminTabs
        idPrefix="access-control"
        ariaLabel="Vai trò và thành viên"
        value={tab}
        onValueChange={changeTab}
        items={[
          { value: "roles", label: "Vai trò", icon: ShieldCheck, count: roles.length },
          ...(canManageMembers
            ? [{ value: "members" as const, label: "Thành viên", icon: UsersRound, count: members.length }]
            : []),
        ]}
      />
      <AdminTabPanel idPrefix="access-control" value={tab} className="space-y-4">
        {tab === "roles" ? (
          <RoleManager roles={roles} canManage={canManageRoles} />
        ) : canManageMembers ? (
          <MemberManager
            items={members}
            trashedItems={trashedMembers}
            currentUserId={currentUserId}
            roles={roles}
          />
        ) : null}
      </AdminTabPanel>
    </div>
  );
}
