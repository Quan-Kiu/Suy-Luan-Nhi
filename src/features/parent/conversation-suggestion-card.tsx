import Link from "next/link";
import { Card } from "@/components/ui";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";

type Suggestion = { title: string; questionText: string; purpose: string } | undefined;

export function ConversationSuggestionCard({
  suggestion,
  content,
}: {
  suggestion: Suggestion;
  content: ContentDictionary;
}) {
  return (
    <Card className="bg-[#eaf3df] p-5">
      <p className="text-xs font-black tracking-wider text-[#587541] uppercase">
        {contentText(content, "dashboard.suggestionLabel", "Gợi ý trò chuyện")}
      </p>
      <h2 className="mt-2 text-xl font-black">
        {suggestion?.title ?? contentText(content, "dashboard.suggestionDefaultTitle", "Hỏi về cách bé nghĩ")}
      </h2>
      <p className="mt-3 font-bold">
        “
        {suggestion?.questionText ??
          contentText(content, "dashboard.suggestionDefaultQuestion", "Con đã thử cách nào trước?")}
        ”
      </p>
      {suggestion?.purpose ? <p className="mt-2 text-sm text-[#61724f]">{suggestion.purpose}</p> : null}
      <Link href="/parent/suggestions" className="mt-4 inline-block text-sm font-black underline">
        {contentText(content, "dashboard.viewSuggestions", "Xem thêm gợi ý")}
      </Link>
    </Card>
  );
}
