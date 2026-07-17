// POST /api/regenerate-slide — rewrites a single slide in a post.
// Body: { post, slideIdx, instruction? }
// Returns: { ok, data: Slide } | { ok: false, error }

import { NextResponse } from "next/server";
import { regenerateSlide } from "@/agent/regenerate-slide";
import { PostSchema } from "@/lib/types";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const InputSchema = z.object({
  post: PostSchema,
  slideIdx: z.number().int().min(0),
  instruction: z.string().max(200).optional(),
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

  const { post, slideIdx, instruction } = parsed.data;
  const result = await regenerateSlide(post, slideIdx, instruction);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: result.data });
}
