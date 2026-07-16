import { NextResponse } from "next/server";
import { parentUnlockSchema } from "@/domain/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = parentUnlockSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: result.error.issues[0]?.message ?? "Không thể mở khóa" },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
