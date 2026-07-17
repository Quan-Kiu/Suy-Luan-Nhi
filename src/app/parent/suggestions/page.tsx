import { MessageCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, Pill } from "@/components/ui";
import { getActiveChild } from "@/modules/family/active-child";
import { getSuggestions } from "@/modules/parent/parent-data";

export default async function Page() {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const items = await getSuggestions(active.child.ageGroup);
  return (
    <>
      <h1 className="text-3xl font-black">Gợi ý trò chuyện</h1>
      <p className="mt-2 text-[#806d54]">
        Những câu hỏi ngắn giúp bé kể lại cách nghĩ mà không biến cuộc trò chuyện thành bài kiểm tra.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-full bg-[#edf4df]">
                <MessageCircle className="text-[#5f8548]" />
              </span>
              {item.ageGroup ? <Pill>{item.ageGroup} tuổi</Pill> : <Pill>Mọi độ tuổi</Pill>}
            </div>
            <h2 className="mt-4 text-xl font-black">{item.title}</h2>
            <p className="mt-3 rounded-2xl bg-[#fff5d8] p-4 text-lg font-black">“{item.questionText}”</p>
            <p className="mt-3 text-sm text-[#6f604b]">{item.purpose}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
