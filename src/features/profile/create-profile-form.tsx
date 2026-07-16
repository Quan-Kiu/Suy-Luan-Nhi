"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { createChildProfileSchema, type ChildProfile, type CreateChildProfileInput } from "@/domain/schemas";
import { saveProfile } from "@/lib/profile-store";
import { requestJson } from "@/lib/http";
import { Button, Card } from "@/components/ui";

const ageOptions = [
  { id: "2-3", title: "2–3 tuổi", note: "Nhận biết và ghép đôi" },
  { id: "4-5", title: "4–5 tuổi", note: "Quy luật đơn giản" },
  { id: "6-8", title: "6–8 tuổi", note: "Suy luận và so sánh" },
] as const;

export function CreateProfileForm() {
  const router = useRouter();
  const form = useForm<CreateChildProfileInput>({
    resolver: zodResolver(createChildProfileSchema),
    defaultValues: { displayName: "", ageGroup: "4-5" },
  });
  const selectedAgeGroup = useWatch({ control: form.control, name: "ageGroup" });
  const mutation = useMutation({
    mutationFn: (input: CreateChildProfileInput) =>
      requestJson<ChildProfile>("/api/children", { method: "POST", body: JSON.stringify(input) }),
    onSuccess(profile) {
      saveProfile(profile);
      toast.success(`Hồ sơ của ${profile.displayName} đã sẵn sàng!`);
      router.push("/profiles");
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-5">
      <Card className="p-5">
        <label className="mb-2 block font-black" htmlFor="displayName">
          Tên thân mật của bé
        </label>
        <p className="mb-3 text-sm text-[#806d54]">Không cần dùng tên thật đâu nhé.</p>
        <input
          id="displayName"
          placeholder="Ví dụ: Bống, Mít..."
          autoComplete="off"
          className="min-h-14 w-full rounded-2xl border-2 border-[#eadfc9] bg-[#fffdf8] px-4 text-lg outline-none focus:border-[#e9641a]"
          {...form.register("displayName")}
        />
        {form.formState.errors.displayName ? (
          <p className="mt-2 text-sm font-bold text-red-700">{form.formState.errors.displayName.message}</p>
        ) : null}
      </Card>

      <Card className="p-5">
        <p className="font-black">Bé thuộc nhóm tuổi nào?</p>
        <p className="mb-4 text-sm text-[#806d54]">Để Bống chọn nhiệm vụ vừa sức nhất.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {ageOptions.map((option) => {
            const selected = selectedAgeGroup === option.id;
            return (
              <label
                key={option.id}
                className={`cursor-pointer rounded-2xl border-2 p-3 text-center transition ${selected ? "border-[#e9641a] bg-[#fff1de]" : "border-[#eadfc9] bg-white"}`}
              >
                <input type="radio" value={option.id} className="sr-only" {...form.register("ageGroup")} />
                <Image
                  src="/assets/mascots/mascot-detective-boy-standing.png"
                  width={92}
                  height={92}
                  alt="Bé thám tử"
                  className="mx-auto h-20 w-20 object-contain"
                />
                <strong className="block">{option.title}</strong>
                <span className="text-xs text-[#806d54]">{option.note}</span>
              </label>
            );
          })}
        </div>
      </Card>

      <Card className="flex gap-3 bg-[#edf4df] p-4">
        <Image
          src="/assets/props/badge-privacy-shield-lock.png"
          width={58}
          height={58}
          alt="Lá chắn riêng tư"
          className="size-14 object-contain"
        />
        <div>
          <p className="font-black text-[#47643a]">Chỉ thu thập điều thật sự cần</p>
          <p className="text-sm text-[#5b714c]">
            Không email của bé, không ngày sinh đầy đủ, không quảng cáo và không mua hàng.
          </p>
        </div>
      </Card>
      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Đang tạo hồ sơ..." : "Bắt đầu chế độ bé  →"}
      </Button>
    </form>
  );
}
