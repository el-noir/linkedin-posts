// POST /api/covers — generates 3 cover headline variants.
// Body: { scenario, archetype, tone }
// Returns: { ok, data: CoverVariants } | { ok: false, error }

import { NextResponse } from "next/server";
import { generateCovers } from "@/agent/generate-covers";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const InputSchema = z.object({
  scenario: z.string().min(5).max(500),
  archetype: z.enum(["auto", "problem-solution", "story-lesson", "contrarian", "listicle", "myth-busting", "behind-the-scenes"]).default("auto"),
  tone: z.enum(["direct", "casual", "authoritative", "provocative", "reflective"]).default("direct"),
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

  const result = await generateCovers(parsed.data.scenario, parsed.data.archetype, parsed.data.tone);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: result.data });
}
