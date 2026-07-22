import Image from "next/image";
import { BarChart3, Heart } from "lucide-react";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { assets } from "@/domain/content";

export function LandingCompanionBanner({ content }: { content: ContentDictionary }) {
  return (
    <section
      aria-labelledby="landing-companion-title"
      className="border-t border-[#efe4cf] bg-[#fffaf0] px-4 py-5 sm:px-5 sm:py-7"
    >
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[28px] border border-[#dce8c8] bg-[#eaf2da] shadow-[0_12px_30px_rgba(77,101,51,.08)]">
          <div className="grid min-h-[116px] grid-cols-[92px_1fr] items-center gap-3 px-4 min-[480px]:min-h-[124px] min-[480px]:grid-cols-[116px_1fr_auto] min-[480px]:gap-5 min-[480px]:px-7 sm:min-h-[128px] sm:grid-cols-[132px_1fr_auto] sm:gap-6 sm:px-8 lg:px-10">
            <div className="relative h-full min-h-[116px] min-[480px]:min-h-[124px] sm:min-h-[128px]">
              <Image
                src={assets.hedgehogMap}
                fill
                sizes="(max-width: 479px) 92px, (max-width: 639px) 116px, 132px"
                alt="Nhím nhỏ đang xem bản đồ"
                className="object-contain object-bottom"
              />
            </div>
            <div className="py-5 sm:py-6">
              <h2 id="landing-companion-title" className="type-section-title">
                {contentText(content, "companion.title", "Đồng hành cùng bé")}
              </h2>
              <p className="type-supporting mt-1 max-w-2xl text-[#536246]">
                {contentText(
                  content,
                  "companion.description",
                  "Theo dõi tiến bộ riêng tư để hiểu bé hơn và động viên đúng lúc.",
                )}
              </p>
            </div>
            <div
              aria-hidden="true"
              className="hidden size-16 place-items-center rounded-full bg-white/90 text-[#6b9b58] shadow-sm min-[480px]:grid sm:size-20"
            >
              <BarChart3 strokeWidth={3} className="size-8 sm:size-[38px]" />
            </div>
          </div>
        </div>
        <p className="type-caption mt-3 flex items-center justify-center gap-1.5 text-center font-medium text-[#7c705f]">
          <Heart size={14} aria-hidden="true" className="fill-[#df5d21] text-[#df5d21]" />
          {contentText(
            content,
            "companion.note",
            "Suy Luận Nhí được xây dựng với tình yêu thương và sự thấu hiểu trẻ em.",
          )}
        </p>
      </div>
    </section>
  );
}
