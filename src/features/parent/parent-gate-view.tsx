import Image from "next/image";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { ParentGateForm } from "@/features/parent/parent-gate-form";
import type { ParentMathChallenge } from "@/modules/family/parent-challenge";

export function ParentGateView({
  hasPin,
  challenge,
  content,
}: {
  hasPin: boolean;
  challenge: ParentMathChallenge;
  content: ContentDictionary;
}) {
  return (
    <main className="paper-texture min-h-screen px-5 py-10">
      <div className="mx-auto max-w-md text-center">
        <Image
          src="/assets/props/badge-privacy-shield-lock.png"
          width={120}
          height={120}
          alt={contentText(content, "gate.imageAlt", "Lá chắn Parent Gate")}
          className="mx-auto size-28 object-contain"
        />
        <h1 className="type-page-title mt-3">{contentText(content, "gate.title", "Khu vực phụ huynh")}</h1>
        <p className="mt-2 text-[#786348]">
          {contentText(
            content,
            "gate.description",
            "Xác nhận người lớn trước khi hiển thị tiến độ và cài đặt gia đình.",
          )}
        </p>
      </div>
      <ParentGateForm hasPin={hasPin} challenge={challenge} />
    </main>
  );
}
