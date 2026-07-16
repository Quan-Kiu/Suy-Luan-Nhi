import { NextResponse } from "next/server";
import { createChildProfileSchema } from "@/domain/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = createChildProfileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: result.error.issues[0]?.message ?? "Thông tin hồ sơ chưa hợp lệ" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    id: crypto.randomUUID(),
    ...result.data,
    avatar: "/assets/mascots/mascot-dog-bong-avatar.png",
    mascot: "Bống",
    currentRank: "Nhà thám hiểm nhí",
    createdAt: new Date().toISOString(),
  });
}
