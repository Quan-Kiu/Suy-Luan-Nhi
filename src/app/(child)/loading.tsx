import { LoadingState } from "@/components/states";

export default function Loading() {
  return (
    <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 py-10">
      <LoadingState label="Đang chuẩn bị hành trình..." />
    </main>
  );
}
