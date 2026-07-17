import { LoadingState } from "@/components/states";

export default function Loading() {
  return (
    <main className="paper-texture min-h-screen px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <LoadingState label="Đang tải hồ sơ bé..." />
      </div>
    </main>
  );
}
