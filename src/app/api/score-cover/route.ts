// POST /api/score-cover — rates a cover headline 1-10 + suggestions.
// Body: { headline, scenario, archetype }
// Returns: { ok, data: CoverScore } | { ok: false, error }

import { NextResponse } from "next/server";
import { scoreCover } from "@/agent/score-cover";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const InputSchema = z.object({
  headline: z.string().min(2).max(200),
  scenario: z.string().min(5).max(500),
  archetype: z.string().default("auto"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: `Invalid input: ${parsed.error.issues.map((i) => i.message).join("; ")}` },
      { status: 400 },
    );
  }

  const { headline, scenario, archetype } = parsed.data;
  const result = await scoreCover(headline, scenario, archetype);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: result.data });
}
