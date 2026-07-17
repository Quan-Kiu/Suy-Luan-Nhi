import { LoadingState } from "@/components/states";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <LoadingState label="Đang tải dữ liệu gia đình..." />
    </div>
  );
}
