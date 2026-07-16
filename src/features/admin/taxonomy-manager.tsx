"use client";

import { useRouter } from "next/navigation";
import { Plus, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { requestJson } from "@/lib/http";

type Age = {
  code: "2-3" | "4-5" | "6-8";
  label: string;
  description: string;
  minAge: number;
  maxAge: number;
  sortOrder: number;
  active: boolean;
};
type Skill = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  active: boolean;
};
const input = "min-h-10 w-full rounded-xl border px-3 text-sm";
export function TaxonomyManager({ ages, skills }: { ages: Age[]; skills: Skill[] }) {
  const router = useRouter();
  const [ageItems, setAgeItems] = useState(ages);
  const [skillItems, setSkillItems] = useState(skills);
  const [newSkill, setNewSkill] = useState({ slug: "", title: "", description: "", category: "thinking" });
  return (
    <div className="space-y-7">
      <section>
        <h2 className="text-2xl font-black">Nhóm tuổi</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ageItems.map((age) => (
            <article key={age.code} className="rounded-2xl border bg-white p-4">
              <strong>{age.code} tuổi</strong>
              <input
                className={`${input} mt-3`}
                placeholder="Ví dụ: 4–5 tuổi"
                value={age.label}
                onChange={(event) =>
                  setAgeItems((items) =>
                    items.map((item) =>
                      item.code === age.code ? { ...item, label: event.target.value } : item,
                    ),
                  )
                }
              />
              <textarea
                rows={4}
                className={`${input} mt-2 py-2`}
                placeholder="Mô tả khả năng và dạng nhiệm vụ phù hợp"
                value={age.description}
                onChange={(event) =>
                  setAgeItems((items) =>
                    items.map((item) =>
                      item.code === age.code ? { ...item, description: event.target.value } : item,
                    ),
                  )
                }
              />
              <label className="mt-3 flex items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  checked={age.active}
                  onChange={(event) =>
                    setAgeItems((items) =>
                      items.map((item) =>
                        item.code === age.code ? { ...item, active: event.target.checked } : item,
                      ),
                    )
                  }
                />
                Đang sử dụng
              </label>
              <button
                type="button"
                onClick={async () => {
                  await requestJson(`/api/admin/age-groups/${age.code}`, {
                    method: "PATCH",
                    body: JSON.stringify(age),
                  });
                  toast.success("Đã lưu nhóm tuổi");
                  router.refresh();
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#3f392f] px-3 py-2 font-black text-white"
              >
                <Save size={15} />
                Lưu
              </button>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-black">Kỹ năng & Thinking Habits</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f7f3eb] text-left">
              <tr>
                <th className="p-3">Kỹ năng</th>
                <th className="p-3">Mô tả</th>
                <th className="p-3">Danh mục</th>
                <th className="p-3">Active</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {skillItems.map((skill) => (
                <tr key={skill.id} className="border-t">
                  <td className="p-3">
                    <input
                      className={input}
                      placeholder="Tên kỹ năng"
                      value={skill.title}
                      onChange={(event) =>
                        setSkillItems((items) =>
                          items.map((item) =>
                            item.id === skill.id ? { ...item, title: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    <small>{skill.slug}</small>
                  </td>
                  <td className="p-3">
                    <textarea
                      rows={2}
                      className={`${input} py-2`}
                      placeholder="Mô tả kỹ năng hoặc thinking habit"
                      value={skill.description}
                      onChange={(event) =>
                        setSkillItems((items) =>
                          items.map((item) =>
                            item.id === skill.id ? { ...item, description: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className={input}
                      placeholder="thinking hoặc habit"
                      value={skill.category}
                      onChange={(event) =>
                        setSkillItems((items) =>
                          items.map((item) =>
                            item.id === skill.id ? { ...item, category: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={skill.active}
                      onChange={(event) =>
                        setSkillItems((items) =>
                          items.map((item) =>
                            item.id === skill.id ? { ...item, active: event.target.checked } : item,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={async () => {
                        await requestJson(`/api/admin/skills/${skill.id}`, {
                          method: "PATCH",
                          body: JSON.stringify(skill),
                        });
                        toast.success("Đã lưu kỹ năng");
                        router.refresh();
                      }}
                      className="rounded-lg border p-2"
                    >
                      <Save size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section
          aria-labelledby="new-skill-title"
          className="mt-4 rounded-2xl border-2 border-dashed bg-white/70 p-4"
        >
          <h3 id="new-skill-title" className="font-black">
            Tạo kỹ năng mới
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr_1fr_160px_auto]">
            <input
              className={input}
              placeholder="slug"
              value={newSkill.slug}
              onChange={(event) => setNewSkill({ ...newSkill, slug: event.target.value })}
            />
            <input
              className={input}
              placeholder="Tên kỹ năng"
              value={newSkill.title}
              onChange={(event) => setNewSkill({ ...newSkill, title: event.target.value })}
            />
            <input
              className={input}
              placeholder="Mô tả"
              value={newSkill.description}
              onChange={(event) => setNewSkill({ ...newSkill, description: event.target.value })}
            />
            <input
              className={input}
              placeholder="category"
              value={newSkill.category}
              onChange={(event) => setNewSkill({ ...newSkill, category: event.target.value })}
            />
            <button
              type="button"
              onClick={async () => {
                await requestJson("/api/admin/skills", { method: "POST", body: JSON.stringify(newSkill) });
                toast.success("Đã tạo kỹ năng");
                router.refresh();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e9641a] px-3 font-black text-white"
            >
              <Plus size={16} />
              Tạo
            </button>
          </div>
        </section>
      </section>
    </div>
  );
}
