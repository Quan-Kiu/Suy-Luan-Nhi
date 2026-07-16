import { WorldManager } from "@/features/admin/world-manager";
import { db } from "@/db/client";
import { missionWorlds } from "@/db/schema";
import { asc } from "drizzle-orm";
export default async function Page() {
  const items = await db.select().from(missionWorlds).orderBy(asc(missionWorlds.sortOrder));
  return (
    <div>
      <h1 className="text-3xl font-black">Mission Worlds</h1>
      <p className="mt-2 mb-5 text-[#806d54]">Quản lý thứ tự, trạng thái, chủ đề và ảnh bìa các thế giới.</p>
      <WorldManager initial={items} />
    </div>
  );
}
