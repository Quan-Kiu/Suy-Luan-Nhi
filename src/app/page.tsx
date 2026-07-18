import * as motion from "motion/react-client";
import Image from "next/image";
import { Check, PlayCircle, ShieldCheck } from "lucide-react";
import { contentText } from "@/content/resolve";
import { assets } from "@/domain/content";
import { AuthAwareEntryLink } from "@/features/landing/auth-aware-entry-link";
import { LandingHeader } from "@/features/landing/landing-header";
import { getContentNamespace } from "@/modules/content/content";

export default async function HomePage() {
  const content = await getContentNamespace("landing");
  const t = (key: string, fallback: string) => contentText(content, key, fallback);
  const trustItems = [
    t("hero.trust.publicRanking", "Không bảng xếp hạng công khai"),
    t("hero.trust.privacy", "Ưu tiên quyền riêng tư"),
    t("hero.trust.positive", "Nội dung ngắn và tích cực"),
  ];
  const safeCards = [
    {
      src: assets.privacy,
      title: t("safe.privacy.title", "Quyền riêng tư là ưu tiên"),
      description: t("safe.privacy.description", "Chỉ dùng tên thân mật và nhóm tuổi để cá nhân hóa."),
    },
    {
      src: "/assets/props/badge-safe-heart.png",
      title: t("safe.noAds.title", "Không quảng cáo"),
      description: t("safe.noAds.description", "Không liên kết ngoài, không mua hàng trong chế độ bé."),
    },
    {
      src: assets.growth,
      title: t("safe.play.title", "Học qua chơi"),
      description: t("safe.play.description", "Khuyến khích quan sát, thử lại và tự kiểm tra."),
    },
  ];

  return (
    <main className="paper-texture min-h-screen overflow-hidden">
      <LandingHeader content={content} />
      <motion.section
        className="mx-auto grid max-w-7xl items-center gap-8 px-5 pt-8 pb-16 lg:grid-cols-[1fr_1.05fr] lg:px-10 lg:pt-14 lg:pb-24"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#edf4df] px-4 py-2 text-sm font-black text-[#557143]">
            <ShieldCheck size={18} /> {t("hero.badge", "Không quảng cáo · Không mua hàng")}
          </p>
          <h1 className="mt-6 max-w-2xl text-5xl leading-[1.02] font-black tracking-tight text-[#40321f] sm:text-6xl lg:text-7xl">
            <span className="text-[#de5b14]">{t("hero.titleAccent", "Nhiệm vụ vui")}</span>
            <br />
            {t("hero.titleRest", "cho bé luyện cách nghĩ")}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#75624b]">
            {t(
              "hero.description",
              "Mỗi ngày một chuyến phiêu lưu ngắn giúp bé quan sát, so sánh, thử lại và tự tin tìm ra cách giải.",
            )}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <AuthAwareEntryLink content={content} />
            <a
              href="#how"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#dac7a7] bg-white px-6 font-black"
            >
              <PlayCircle size={20} /> {t("hero.secondaryCta", "Xem cách hoạt động")}
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-[#6c7d58]">
            {trustItems.map((item) => (
              <span key={item} className="flex items-center gap-1">
                <Check size={16} />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[420px] lg:min-h-[620px]">
          <div className="absolute inset-4 rounded-[60px] bg-[#f5dfb7]/65 blur-3xl" />
          <Image
            src={assets.hero}
            fill
            priority
            alt="Bé thám tử và chú chó Bống khám phá bản đồ trong lều"
            className="relative object-contain drop-shadow-2xl"
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
        </div>
      </motion.section>
      <section id="safe" className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
        <h2 className="text-center text-3xl font-black">
          {t("safe.title", "An tâm cho bé, vui học mỗi ngày")}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {safeCards.map((card) => (
            <motion.article
              key={card.title}
              className="rounded-[30px] border border-[#eadfc9] bg-white/90 p-6 text-center shadow-[0_16px_40px_rgba(95,67,31,.08)]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              whileHover={{ y: -4 }}
            >
              <Image
                src={card.src}
                width={105}
                height={105}
                alt=""
                className="mx-auto h-24 w-24 object-contain"
              />
              <h3 className="mt-3 text-xl font-black">{card.title}</h3>
              <p className="mt-2 text-[#77654d]">{card.description}</p>
            </motion.article>
          ))}
        </div>
      </section>
      <section id="how" className="bg-[#edf4df] px-5 py-16 text-center">
        <Image
          src={assets.hedgehogThumb}
          width={100}
          height={100}
          alt="Nhím phụ tá giơ ngón tay cái"
          className="mx-auto h-24 w-24 object-contain"
        />
        <h2 className="text-3xl font-black">{t("how.title", "Một nhiệm vụ nhỏ, một thói quen nghĩ mới")}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#617149]">
          {t(
            "how.description",
            "Chọn thế giới, quan sát câu hỏi, nhận gợi ý dịu dàng và cùng bé chúc mừng từng lần thử.",
          )}
        </p>
      </section>
    </main>
  );
}
