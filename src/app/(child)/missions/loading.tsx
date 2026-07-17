import { LoadingState } from "@/components/states";

export default function Loading() {
  return (
    <main className="paper-texture min-h-screen px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <LoadingState label="Đang mở bản đồ nhiệm vụ..." />
      </div>
    </main>
  );
}
