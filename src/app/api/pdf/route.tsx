// POST /api/pdf — renders a Post to a PDF and streams it back.
// Body: Post (the full post object)
// Returns: application/pdf

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { CarouselPdf } from "@/render/CarouselPdf";
import { PostSchema } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: `Invalid post: ${parsed.error.issues.map((i) => i.message).join("; ")}` },
      { status: 400 },
    );
  }

  try {
    const buffer = await renderToBuffer(<CarouselPdf post={parsed.data} />);
    const slug = parsed.data.topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="linkedin-carousel-${slug}.pdf"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `PDF render failed: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 },
    );
  }
}
