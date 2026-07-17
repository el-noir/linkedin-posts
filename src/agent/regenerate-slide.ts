// Regenerate a single slide — not the whole post.
// The full post is context; the agent rewrites just one slide.
// Optional instruction: "make it punchier", "shorter", "add a specific example".

import { createAnthropicClient, getModel, parseStructured } from "@/lib/anthropic";
import { PROFILE } from "@/lib/profile";
import { SlideSchema } from "@/lib/types";
import type { Post } from "@/lib/types";
import type { Result } from "@/lib/result";
import type { z } from "zod";

export async function regenerateSlide(
  post: Post,
  slideIdx: number,
  instruction?: string,
): Promise<Result<z.infer<typeof SlideSchema>>> {
  const client = createAnthropicClient();
  const model = getModel("zai-org/GLM-5.2");

  const idx = slideIdx + 1; // 1-based for display
  const current = post.slides[slideIdx];
  if (!current) {
    return { ok: false, error: `Slide index ${slideIdx} out of range (0-${post.slides.length - 1})` };
  }

  const isCover = slideIdx === 0;
  const isClosing = slideIdx === post.slides.length - 1;

  const roleDesc = isCover
    ? "the COVER slide (headline only, no body). Make it provocative and swipeable, at most 8 words."
    : isClosing
      ? "the CLOSING slide (takeaway + a specific question that drives comments)."
      : `slide ${idx} (one idea: short headline + 2-4 sentences of body).`;

  const system = [
    `You are a LinkedIn content editor for ${PROFILE.name}.`,
    `Tone: ${PROFILE.tone}`,
    `You are rewriting ONE slide in an existing carousel. Keep the rest unchanged.`,
    `Match the voice and style of the other slides. Stay on topic.`,
    `Use smart quotes, em-dashes, ellipsis. No straight quotes.`,
    `Output strict JSON: { "headline": "...", "body": "..." } (omit body for cover).`,
  ].join("\n");

  const user = [
    `Topic: ${post.topic}`,
    `Archetype: ${post.archetype}`,
    ``,
    `Full post for context:`,
    ...post.slides.map((s, i) => `  Slide ${i + 1}: ${s.headline}${s.body ? "\n  " + s.body : ""}`),
    ``,
    `Rewrite ${roleDesc}`,
    ``,
    `Current slide ${idx}:`,
    `  Headline: ${current.headline}`,
    `  Body: ${current.body ?? "(none)"}`,
    ``,
    instruction ? `Instruction: ${instruction}` : `Instruction: improve it — make it sharper, more specific, more engaging.`,
    ``,
    `Output ONLY the JSON object for this one slide. No code fences.`,
  ].join("\n");

  return parseStructured(
    client,
    {
      model,
      max_tokens: 800,
      system,
      messages: [{ role: "user", content: user }],
    },
    SlideSchema,
  );
}
