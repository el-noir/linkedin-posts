// Score a cover headline 1-10 for swipe-triggering power.
// Self-critique — the agent rates its own hook and suggests improvements.
// Uses the same covers infrastructure (small LLM call, fast).

import { createAnthropicClient, getModel, parseStructured } from "@/lib/anthropic";
import { PROFILE } from "@/lib/profile";
import { z } from "zod";
import type { Result } from "@/lib/result";

export const CoverScoreSchema = z.object({
  score: z.number().min(1).max(10).describe("Harsh 1-10 rating of swipe-triggering power."),
  strengths: z.array(z.string().max(150)).max(2).describe("1-2 specific strengths of the headline."),
  improvements: z
    .array(z.string().max(150))
    .max(2)
    .describe("1-2 concrete, actionable improvements that would raise the score."),
});

export type CoverScore = z.infer<typeof CoverScoreSchema>;

export async function scoreCover(
  headline: string,
  scenario: string,
  archetype: string,
): Promise<Result<CoverScore>> {
  const client = createAnthropicClient();
  const model = getModel("zai-org/GLM-5.2");

  const system = [
    `You are a harsh LinkedIn hook critic. Rate cover headlines for carousel posts.`,
    `Be brutal. A 7 means good. A 5 means average. A 3 means boring. Most headlines score 4-6.`,
    `${PROFILE.name} is a ${PROFILE.title}. The audience is technical professionals on LinkedIn.`,
    `Output strict JSON. No code fences.`,
  ].join("\n");

  const user = [
    `Scenario: ${scenario}`,
    `Archetype: ${archetype}`,
    `Headline to rate: "${headline}"`,
    ``,
    `Rate this headline 1-10 for its power to make someone stop scrolling and swipe the carousel.`,
    `Consider: specificity, curiosity gap, emotional trigger, credibility, length (≤ 8 words ideal).`,
    `Give 1-2 specific strengths and 1-2 concrete improvements.`,
    `Improvements must be actionable — not "make it better" but "add a specific number" or "lead with the contrarian claim".`,
    ``,
    `Output ONLY: { "score": N, "strengths": [...], "improvements": [...] }`,
  ].join("\n");

  return parseStructured(
    client,
    {
      model,
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: user }],
    },
    CoverScoreSchema,
  );
}
