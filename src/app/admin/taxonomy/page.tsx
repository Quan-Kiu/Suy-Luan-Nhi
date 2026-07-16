import { asc } from "drizzle-orm";
import { TaxonomyManager } from "@/features/admin/taxonomy-manager";
import { db } from "@/db/client";
import { ageGroups, skills } from "@/db/schema";
export default async function Page() {
  const [ages, skillRows] = await Promise.all([
    db.select().from(ageGroups).orderBy(asc(ageGroups.sortOrder)),
    db.select().from(skills).orderBy(asc(skills.title)),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-black">Độ tuổi & kỹ năng</h1>
      <p className="mt-2 mb-5 text-[#806d54]">
        Taxonomy dùng chung cho catalog, CMS, báo cáo và gợi ý phụ huynh.
      </p>
      <TaxonomyManager ages={ages} skills={skillRows} />
    </div>
  );
}
