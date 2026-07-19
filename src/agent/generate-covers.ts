// A/B cover generation — generates 3 cover headline variants for a scenario.
// The cover drives ~80% of swipes, so generating options is the biggest
// engagement lever. One small LLM call, fast.

import { createAnthropicClient, getModel, parseStructured } from "@/lib/anthropic";
import { PROFILE } from "@/lib/profile";
import { z } from "zod";
import type { Result } from "@/lib/result";
import type { Archetype, Tone } from "@/lib/types";

export const CoverVariantsSchema = z.object({
  variants: z
    .array(
      z.object({
        headline: z.string().max(120).describe("A cover headline, at most 8 words. Can include \\n for line breaks."),
        rationale: z
          .string()
          .max(200)
          .describe("One sentence on why this hook works for this scenario + archetype."),
      }),
    )
    .min(3)
    .max(3),
});

export type CoverVariants = z.infer<typeof CoverVariantsSchema>;

export async function generateCovers(
  scenario: string,
  archetype: Archetype,
  tone: Tone,
  mode: "scenario" | "content" = "scenario",
): Promise<Result<CoverVariants>> {
  const client = createAnthropicClient();
  const model = getModel("zai-org/GLM-5.2");

  const archetypeLine =
    archetype === "auto"
      ? "Pick the archetype that best fits the material before writing covers."
      : `Archetype: ${archetype} (forced).`;

  const sourceLine = mode === "content"
    ? `Source content (extract hooks from this — don't invent ideas not in the text):\n${scenario}`
    : `Scenario: ${scenario}`;

  const system = [
    `You are a LinkedIn hook writer for ${PROFILE.name}, a ${PROFILE.title}.`,
    `Tone: ${tone}. ${PROFILE.tone}`,
    `Write cover headlines that stop the scroll. Provocative, specific, no hype words.`,
    `Each variant must use a different angle (e.g. bold claim, question, contrarian, story tease, number).`,
    `Output strict JSON. No code fences. No commentary.`,
  ].join("\n");

  const user = [
    sourceLine,
    archetypeLine,
    ``,
    `Write 3 cover headline variants for a LinkedIn carousel.`,
    `Each headline: at most 8 words, no subtitle, no label clutter.`,
    `Each variant must use a different hook angle — no two variants share the same approach.`,
    `For each, give a one-sentence rationale for why it works.`,
    ``,
    `Output ONLY the JSON object: { "variants": [{ "headline": "...", "rationale": "..." }, ...] }`,
  ].join("\n");

  return parseStructured(
    client,
    {
      model,
      max_tokens: 800,
      system,
      messages: [{ role: "user", content: user }],
    },
    CoverVariantsSchema,
  );
}
