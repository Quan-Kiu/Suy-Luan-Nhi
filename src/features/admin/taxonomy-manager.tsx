"use client";

import { contentText, useContent } from "@/content/client";
import { AgeGroupForm, type AgeGroupItem } from "@/features/admin/age-group-form";
import { CreateSkillForm } from "@/features/admin/create-skill-form";
import { SkillForm, type SkillItem } from "@/features/admin/skill-form";

export function TaxonomyManager({ ages, skills }: { ages: AgeGroupItem[]; skills: SkillItem[] }) {
  const content = useContent("admin");
  return (
    <div className="space-y-7">
      <section>
        <h2 className="text-2xl font-black">{contentText(content, "taxonomy.ageTitle", "Nhóm tuổi")}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6f6558]">
          Mỗi hồ sơ bé thuộc một nhóm tuổi. Mô tả nên nói rõ kiểu nhiệm vụ phù hợp, không đánh giá khả năng
          của trẻ.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ages.map((age) => (
            <article key={age.code} className="rounded-2xl border bg-white p-4">
              <AgeGroupForm item={age} />
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-black">
          {contentText(content, "taxonomy.skillTitle", "Kỹ năng và thói quen tích cực")}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6f6558]">
          Những nhãn này xuất hiện khi soạn nhiệm vụ và trong phần tổng hợp dành cho phụ huynh. Dùng tên ngắn
          và mô tả hành vi có thể quan sát được.
        </p>
        <div className="mt-4 space-y-3">
          {skills.map((skill) => (
            <article
              key={skill.id}
              aria-label={`Kỹ năng: ${skill.title}`}
              className="rounded-2xl border bg-white p-4"
            >
              <SkillForm item={skill} />
            </article>
          ))}
        </div>
        <div className="mt-4">
          <CreateSkillForm />
        </div>
      </section>
    </div>
  );
}
