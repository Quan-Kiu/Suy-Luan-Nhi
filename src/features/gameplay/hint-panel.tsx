import Image from "next/image";
import { Card } from "@/components/ui";

export function HintPanel({ text, imageAlt }: { text: string; imageAlt: string }) {
  return (
    <Card className="mt-4 flex gap-3 bg-[#fff6d8] p-4" role="status" aria-live="polite">
      <Image
        src="/assets/mascots/mascot-dog-detective.png"
        width={64}
        height={64}
        alt={imageAlt}
        className="size-16 object-contain"
      />
      <p className="self-center font-bold">{text}</p>
    </Card>
  );
}
