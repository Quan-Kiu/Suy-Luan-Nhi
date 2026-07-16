"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, Card } from "@/components/ui";
import { requestJson } from "@/lib/http";
const schema = z.object({
  displayName: z.string().trim().min(1).max(20),
  ageGroup: z.enum(["2-3", "4-5", "6-8"]),
});
export function EditProfileForm({
  child,
}: {
  child: { id: string; displayName: string; ageGroup: "2-3" | "4-5" | "6-8" };
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: child });
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await requestJson(`/api/children/${child.id}`, { method: "PATCH", body: JSON.stringify(values) });
          toast.success("Đã cập nhật hồ sơ");
          router.push("/profiles");
          router.refresh();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Không thể cập nhật");
        }
      })}
    >
      <Card className="space-y-4 p-5">
        <label className="block font-black">
          Tên thân mật
          <input
            className="mt-2 min-h-12 w-full rounded-2xl border-2 border-[#eadfc9] px-4"
            placeholder="Tên thân mật của bé"
            {...form.register("displayName")}
          />
        </label>
        <label className="block font-black">
          Nhóm tuổi
          <select
            className="mt-2 min-h-12 w-full rounded-2xl border-2 border-[#eadfc9] px-4"
            {...form.register("ageGroup")}
          >
            <option value="2-3">2–3 tuổi</option>
            <option value="4-5">4–5 tuổi</option>
            <option value="6-8">6–8 tuổi</option>
          </select>
        </label>
      </Card>
      <Button className="w-full">Lưu thay đổi</Button>
    </form>
  );
}
