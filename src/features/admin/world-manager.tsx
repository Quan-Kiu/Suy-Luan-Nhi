"use client";

import { contentText, useContent } from "@/content/client";
import { WorldForm, type WorldItem } from "@/features/admin/world-form";

export function WorldManager({ initial }: { initial: WorldItem[] }) {
  const content = useContent("admin");
  return (
    <div className="space-y-5">
      <div className="grid gap-4 2xl:grid-cols-2">
        {initial.map((item) => (
          <article
            key={item.id}
            aria-label={`Chủ đề nhiệm vụ: ${item.title}`}
            className="rounded-2xl border bg-white p-4"
          >
            <WorldForm mode="edit" initial={item} />
          </article>
        ))}
      </div>
      <article className="rounded-2xl border-2 border-dashed bg-white/70 p-5">
        <h2 className="text-xl font-black">
          {contentText(content, "world.createTitle", "Thêm chủ đề nhiệm vụ")}
        </h2>
        <div className="mt-4">
          <WorldForm
            mode="create"
            initial={{
              slug: "",
              title: "",
              subtitle: "",
              description: "",
              sortOrder: initial.length + 1,
              themeColor: "green",
              coverUrl: "/assets/cards/world-card-detective-rules.png",
              status: "draft",
            }}
          />
        </div>
      </article>
    </div>
  );
}
