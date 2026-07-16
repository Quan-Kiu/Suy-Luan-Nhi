import Image from "next/image";
import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="paper-texture grid min-h-screen place-items-center px-5 py-10">
      <section className="w-full max-w-md rounded-[32px] border border-[#eadfc9] bg-white/95 p-6 shadow-[0_24px_70px_rgba(73,50,25,.16)] sm:p-8">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2">
          <Image
            src="/assets/mascots/brand-logo-detective-head.png"
            width={52}
            height={55}
            alt="Suy Luận Nhí"
            className="h-14 w-auto object-contain"
          />
          <span className="text-lg font-black">Suy Luận Nhí</span>
        </Link>
        <div className="mt-5 text-center">
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#806d54]">{subtitle}</p>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
