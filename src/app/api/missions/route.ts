import { NextResponse } from "next/server";
import { missionWorlds } from "@/domain/content";
import { missionWorldSchema } from "@/domain/schemas";

export async function GET() {
  const worlds = missionWorlds.map((world) => missionWorldSchema.parse(world));
  return NextResponse.json(worlds);
}
