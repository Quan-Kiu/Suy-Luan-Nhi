"use client";

import { ChevronDown, Plus } from "lucide-react";
import { contentText, useContent } from "@/content/client";
import { AgeGroupForm, type AgeGroupItem } from "@/features/admin/age-group-form";
import { CreateSkillForm } from "@/features/admin/create-skill-form";
import { SkillForm, type SkillItem } from "@/features/admin/skill-form";

export function TaxonomyManager({ ages, skills }: { ages: AgeGroupItem[]; skills: SkillItem[] }) {
  const content = useContent("admin");
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-black">{contentText(content, "taxonomy.ageTitle", "Nhóm tuổi")}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-5 text-[#6f6558]">
          Mỗi hồ sơ bé thuộc một nhóm tuổi. Mở từng nhóm để sửa tên, mô tả hoặc trạng thái sử dụng.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ages.map((age) => (
            <details
              key={age.code}
              role="article"
              aria-label={`Nhóm tuổi: ${age.label}`}
              className="group overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black">{age.label}</h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-black ${
                        age.active ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {age.active ? "Đang dùng" : "Đang tắt"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#6f6558]">{age.description}</p>
                </div>
                <ChevronDown size={19} className="shrink-0 transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-[#eadfc9] p-4">
                <AgeGroupForm item={age} />
              </div>
            </details>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black">
          {contentText(content, "taxonomy.skillTitle", "Kỹ năng và thói quen tích cực")}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-5 text-[#6f6558]">
          Mở từng kỹ năng khi cần chỉnh sửa. Danh sách thu gọn giúp kiểm tra nhanh tên, loại và trạng thái.
        </p>
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {skills.map((skill) => (
            <details
              key={skill.id}
              role="article"
              aria-label={`Kỹ năng: ${skill.title}`}
              className={`group overflow-hidden rounded-2xl border bg-white shadow-sm ${
                skill.active ? "" : "opacity-75"
              }`}
            >
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-black">{skill.title}</h3>
                    <span className="rounded-full bg-[#eef4e4] px-2.5 py-1 text-xs font-black text-[#557047]">
                      {skill.category === "habit" ? "Thói quen tích cực" : "Kỹ năng suy luận"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-black ${
                        skill.active ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {skill.active ? "Đang dùng" : "Đang tắt"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#6f6558]">{skill.description}</p>
                </div>
                <ChevronDown size={19} className="shrink-0 transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-[#eadfc9] p-4">
                <SkillForm item={skill} />
              </div>
            </details>
          ))}
        </div>
        <details className="group mt-3 overflow-hidden rounded-2xl border-2 border-dashed bg-white/70">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#fff0df] text-[#b9470d]">
                <Plus size={19} />
              </span>
              <div>
                <h3 className="font-black">Thêm kỹ năng mới</h3>
                <p className="mt-0.5 text-sm text-[#6f6558]">Mở biểu mẫu khi cần bổ sung kỹ năng.</p>
              </div>
            </div>
            <ChevronDown size={19} className="transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-[#eadfc9] p-4">
            <CreateSkillForm />
          </div>
        </details>
      </section>
    </div>
  );
}
