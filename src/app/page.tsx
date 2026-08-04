import * as motion from "motion/react-client";
import Image from "next/image";
import { Check, HeartHandshake, PlayCircle, Puzzle, ShieldCheck, UserRoundPlus } from "lucide-react";
import { contentText } from "@/content/resolve";
import { assets } from "@/domain/content";
import { AuthAwareEntryLink } from "@/features/landing/auth-aware-entry-link";
import { LandingCompanionBanner } from "@/features/landing/landing-companion-banner";
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
  const howSteps = [
    {
      icon: UserRoundPlus,
      number: "1",
      title: t("how.step1.title", "Ba mẹ tạo hồ sơ cho bé"),
      description: t(
        "how.step1.description",
        "Chỉ cần tên ở nhà, nhóm tuổi và một ảnh đại diện. Không cần thông tin nhạy cảm.",
      ),
    },
    {
      icon: Puzzle,
      number: "2",
      title: t("how.step2.title", "Bé chọn một nhiệm vụ ngắn"),
      description: t(
        "how.step2.description",
        "Mỗi nhiệm vụ chỉ mất vài phút, có hướng dẫn rõ ràng và gợi ý khi bé cần.",
      ),
    },
    {
      icon: HeartHandshake,
      number: "3",
      title: t("how.step3.title", "Ba mẹ xem bé đã luyện gì"),
      description: t(
        "how.step3.description",
        "Xem kỹ năng bé vừa dùng và gợi ý đồng hành, không có xếp hạng hay so sánh.",
      ),
    },
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
          <p className="type-label inline-flex items-center gap-2 rounded-full bg-[#edf4df] px-4 py-2 font-black text-[#557143]">
            <ShieldCheck size={18} /> {t("hero.badge", "Không quảng cáo · Không mua hàng")}
          </p>
          <h1 className="type-display mt-6 max-w-2xl">
            <span className="text-[#de5b14]">{t("hero.titleAccent", "Nhiệm vụ vui")}</span>
            <br />
            {t("hero.titleRest", "cho bé luyện cách nghĩ")}
          </h1>
          <p className="type-lead mt-5 max-w-xl text-[#75624b]">
            {t(
              "hero.description",
              "Mỗi ngày một chuyến phiêu lưu ngắn giúp bé quan sát, so sánh, thử lại và tự tin tìm ra cách giải.",
            )}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <AuthAwareEntryLink content={content} hideForStaff />
            <a
              href="#how"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#dac7a7] bg-white px-6 font-black"
            >
              <PlayCircle size={20} /> {t("hero.secondaryCta", "Xem 3 bước bắt đầu")}
            </a>
          </div>
          <div className="type-label mt-5 flex flex-wrap gap-x-5 gap-y-2 font-bold text-[#6c7d58]">
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
            preload
            alt="Bé thám tử và chú chó Bống khám phá bản đồ trong lều"
            className="relative object-contain drop-shadow-2xl"
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
        </div>
      </motion.section>

      <section id="how" aria-labelledby="how-title" className="scroll-mt-6 bg-[#edf4df] px-5 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="type-overline font-black tracking-[0.16em] text-[#567044] uppercase">
              {t("how.eyebrow", "Bắt đầu rất đơn giản")}
            </p>
            <h2 id="how-title" className="type-marketing-title mt-3">
              {t("how.title", "Ba bước để bé bắt đầu một nhiệm vụ")}
            </h2>
            <p className="type-lead mx-auto mt-4 max-w-2xl text-[#617149]">
              {t(
                "how.description",
                "Ba mẹ tạo hồ sơ một lần. Sau đó bé chọn nhiệm vụ phù hợp, làm theo hướng dẫn và có thể nhận gợi ý bất cứ lúc nào.",
              )}
            </p>
          </div>

          <ol className="mt-10 grid gap-5 lg:grid-cols-3">
            {howSteps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.number}
                  className="relative rounded-[30px] border border-[#d9e6c6] bg-white/90 p-6 text-left shadow-[0_16px_40px_rgba(75,101,49,.08)]"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid size-14 place-items-center rounded-2xl bg-[#fff0df] text-[#d65a16]">
                      <Icon size={28} aria-hidden="true" />
                    </span>
                    <span className="type-label grid size-9 place-items-center rounded-full bg-[#5f7846] font-black text-white">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="type-card-title mt-5">{step.title}</h3>
                  <p className="mt-3 leading-7 text-[#75684f]">{step.description}</p>
                </motion.li>
              );
            })}
          </ol>

          <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-5 rounded-[28px] border border-[#d4e0c2] bg-[#f8fbf2] px-5 py-6 text-center sm:px-8">
            <p className="leading-7 font-bold text-[#53673d]">
              {t(
                "how.note",
                "Bé được thử lại thoải mái. Hệ thống ghi nhận nỗ lực, không phạt khi bé trả lời chưa đúng.",
              )}
            </p>
            <AuthAwareEntryLink content={content} hideForStaff />
          </div>
        </div>
      </section>

      <section id="safe" className="mx-auto max-w-7xl scroll-mt-6 px-5 py-20 lg:px-10">
        <h2 className="type-marketing-title text-center">
          {t("safe.title", "An tâm cho bé, vui học mỗi ngày")}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {safeCards.map((card) => (
            <motion.article
              key={card.title}
              className="rounded-[30px] border border-[#eadfc9] bg-white/90 p-6 text-center shadow-[0_16px_40px_rgba(95,67,31,.08)]"
              whileHover={{ y: -4 }}
            >
              <Image
                src={card.src}
                width={105}
                height={105}
                alt=""
                className="mx-auto h-24 w-24 object-contain"
              />
              <h3 className="type-card-title mt-3">{card.title}</h3>
              <p className="mt-2 text-[#77654d]">{card.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <LandingCompanionBanner content={content} />
    </main>
  );
}
