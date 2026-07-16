import { NextResponse } from "next/server";
import { isSafetyChecklistComplete, missionEditorRequestSchema } from "@/domain/schemas";

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const result = missionEditorRequestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        message: result.error.issues[0]?.message ?? "Nội dung nhiệm vụ chưa hợp lệ",
        issues: result.error.flatten(),
      },
      { status: 400 },
    );
  }

  const publishReady = isSafetyChecklistComplete(result.data.mission.safety);
  if (result.data.action === "submit" && !publishReady) {
    return NextResponse.json(
      { message: "Hãy hoàn tất Checklist an toàn trước khi gửi duyệt" },
      { status: 422 },
    );
  }

  return NextResponse.json({
    savedAt: new Date().toISOString(),
    status: result.data.action === "submit" ? "in_review" : "draft",
    publishReady,
  });
}
