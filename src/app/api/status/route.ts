import { NextResponse } from "next/server";
import { getProviderConfig } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

/** Public status: tells the UI whether a real AI provider is connected. Never exposes keys. */
export function GET() {
  const cfg = getProviderConfig();
  return NextResponse.json({ aiEnabled: Boolean(cfg), provider: cfg?.name ?? null });
}
