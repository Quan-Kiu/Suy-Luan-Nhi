import type { Metadata } from "next";
import Image from "next/image";
import { resolveEmailVerificationResult, resolveVerificationContinuePath } from "@/auth/email-verification";
import { EmailVerificationResultDialog } from "@/features/auth/email-verification-result-dialog";

export const metadata: Metadata = {
  title: "Xác minh email | Suy Luận Nhí",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const result = resolveEmailVerificationResult(params.error);
  const continueHref = resolveVerificationContinuePath(params.next);

  return (
    <>
      <main aria-hidden="true" className="paper-texture grid min-h-screen place-items-center px-5 py-10">
        <section className="w-full max-w-md rounded-[32px] border border-[#eadfc9] bg-white/90 p-8 shadow-[0_24px_70px_rgba(73,50,25,.16)]">
          <Image
            src="/assets/mascots/brand-logo-detective-head.png"
            width={72}
            height={76}
            alt=""
            className="mx-auto h-20 w-auto object-contain opacity-70"
          />
          <div className="mx-auto mt-7 h-7 w-2/3 rounded-full bg-[#efe4d2]" />
          <div className="mx-auto mt-3 h-4 w-full rounded-full bg-[#f4ecdf]" />
          <div className="mx-auto mt-2 h-4 w-4/5 rounded-full bg-[#f4ecdf]" />
        </section>
      </main>
      <EmailVerificationResultDialog result={result} continueHref={continueHref} />
    </>
  );
}
