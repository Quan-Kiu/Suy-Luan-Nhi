import { LoadingState } from "@/components/states";

export default function Loading() {
  return (
    <main className="paper-texture min-h-screen px-5 py-20">
      <div className="mx-auto max-w-xl">
        <LoadingState label="Đang chuẩn bị chuyến khám phá..." />
      </div>
    </main>
  );
}
