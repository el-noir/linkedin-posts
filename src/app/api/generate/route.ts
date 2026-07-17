// POST /api/generate — generates a post via GLM-5.2 and saves it.
// Body: { scenario, archetype?, tone?, slideCount? }
// Returns: { ok, data: Post } | { ok: false, error }

import { NextResponse } from "next/server";
import { generatePost } from "@/agent/generate";
import { savePost } from "@/lib/post-store";
import { GenerateInputSchema } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GenerateInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: `Invalid input: ${parsed.error.issues.map((i) => i.message).join("; ")}` },
      { status: 400 },
    );
  }

  const result = await generatePost(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  let id = "";
  try {
    id = await savePost(result.data);
  } catch (e) {
    console.error("Failed to save post:", e);
  }

  return NextResponse.json({ ok: true, data: result.data, id });
}
