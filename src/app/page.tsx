import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, PlayCircle, ShieldCheck } from "lucide-react";
import { assets } from "@/domain/content";

export default function HomePage() {
  return (
    <main className="paper-texture min-h-screen overflow-hidden">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
        <Image
          src={assets.logo}
          width={190}
          height={66}
          alt="Suy Luận Nhí"
          className="h-14 w-auto object-contain"
        />
        <nav className="hidden items-center gap-7 text-sm font-black md:flex">
          <a href="#how">Cách hoạt động</a>
          <a href="#safe">An toàn cho bé</a>
          <Link href="/parent" className="rounded-full border border-[#e4d5ba] bg-white px-4 py-2">
            Khu vực phụ huynh
          </Link>
        </nav>
      </header>
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 pt-8 pb-16 lg:grid-cols-[1fr_1.05fr] lg:px-10 lg:pt-14 lg:pb-24">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#edf4df] px-4 py-2 text-sm font-black text-[#557143]">
            <ShieldCheck size={18} /> Không quảng cáo · Không mua hàng
          </p>
          <h1 className="mt-6 max-w-2xl text-5xl leading-[1.02] font-black tracking-tight text-[#40321f] sm:text-6xl lg:text-7xl">
            <span className="text-[#de5b14]">Nhiệm vụ vui</span>
            <br />
            cho bé luyện cách nghĩ
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#75624b]">
            Mỗi ngày một chuyến phiêu lưu ngắn giúp bé quan sát, so sánh, thử lại và tự tin tìm ra cách giải.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/sign-up"
              className="wood-button inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-6 font-black text-white"
            >
              Tạo hồ sơ cho bé <ArrowRight size={20} />
            </Link>
            <a
              href="#how"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#dac7a7] bg-white px-6 font-black"
            >
              <PlayCircle size={20} /> Xem cách hoạt động
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-[#6c7d58]">
            {["Không bảng xếp hạng công khai", "Ưu tiên quyền riêng tư", "Nội dung ngắn và tích cực"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1">
                  <Check size={16} />
                  {item}
                </span>
              ),
            )}
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
      </section>
      <section id="safe" className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
        <h2 className="text-center text-3xl font-black">An tâm cho bé, vui học mỗi ngày</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              assets.privacy,
              "Quyền riêng tư là ưu tiên",
              "Chỉ dùng tên thân mật và nhóm tuổi để cá nhân hóa.",
            ],
            [
              "/assets/props/badge-safe-heart.png",
              "Không quảng cáo",
              "Không liên kết ngoài, không mua hàng trong chế độ bé.",
            ],
            [assets.growth, "Học qua chơi", "Khuyến khích quan sát, thử lại và tự kiểm tra."],
          ].map(([src, title, desc]) => (
            <article
              key={title}
              className="rounded-[30px] border border-[#eadfc9] bg-white/90 p-6 text-center shadow-[0_16px_40px_rgba(95,67,31,.08)]"
            >
              <Image src={src} width={105} height={105} alt="" className="mx-auto h-24 w-24 object-contain" />
              <h3 className="mt-3 text-xl font-black">{title}</h3>
              <p className="mt-2 text-[#77654d]">{desc}</p>
            </article>
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
        <h2 className="text-3xl font-black">Một nhiệm vụ nhỏ, một thói quen nghĩ mới</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#667653]">
          Chọn thế giới, quan sát câu hỏi, nhận gợi ý dịu dàng và cùng bé chúc mừng từng lần thử.
        </p>
      </section>
    </main>
  );
}
