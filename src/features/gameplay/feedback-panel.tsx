import { Trophy } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";

export function FeedbackPanel({
  correct,
  text,
  completeReady,
  completing,
  content,
  onContinue,
  onRetry,
}: {
  correct: boolean;
  text: string;
  completeReady: boolean;
  completing: boolean;
  content: ContentDictionary;
  onContinue: () => void;
  onRetry: () => void;
}) {
  return (
    <Card
      className={`mt-4 p-4 ${correct ? "border-green-200 bg-[#edf6e6]" : "border-amber-200 bg-[#fff6df]"}`}
      role="status"
      aria-live="polite"
    >
      <p className={`type-child-section-title ${correct ? "text-green-700" : "text-[#b75e13]"}`}>
        {correct
          ? contentText(content, "feedback.correctTitle", "Tuyệt vời!")
          : contentText(content, "feedback.retryTitle", "Chưa chính xác")}
      </p>
      <p className="mt-1">{text}</p>
      {correct ? (
        <Button type="button" onClick={onContinue} disabled={completing} className="mt-4 w-full">
          {completeReady ? (
            <>
              <Trophy size={19} className="mr-2 inline" />
              {contentText(content, "actions.claimBadge", "Nhận huy hiệu")}
            </>
          ) : (
            contentText(content, "actions.nextQuestion", "Câu tiếp theo →")
          )}
        </Button>
      ) : (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-12 w-full rounded-2xl border-2 border-[#d99539] bg-white font-black text-[#8a4b12] shadow-[0_4px_0_#e7c48f] transition-colors hover:bg-[#fff8e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b75e13]"
        >
          {contentText(content, "actions.retry", "Thử lại")}
        </button>
      )}
    </Card>
  );
}
