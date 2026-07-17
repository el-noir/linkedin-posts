// Prompt builders — system prompt (always you) + user prompt (per generation).
// The system prompt encodes your profile, archetype styles, tone, and rules.
// The user prompt encodes the scenario + archetype + tone + length for this post.

import { PROFILE } from "./profile";
import type { GenerateInput } from "./types";

const skillsFlat = Object.entries(PROFILE.skills)
  .map(([k, v]) => `${k}: ${v.join(", ")}`)
  .join("\n");

const archetypeList = Object.entries(PROFILE.archetypeStyles)
  .map(([name, desc]) => `- ${name}: ${desc}`)
  .join("\n");

export function buildSystemPrompt(tone: string): string {
  return [
    `You are a LinkedIn content agent for ${PROFILE.name}, a ${PROFILE.title} in ${PROFILE.location}.`,
    ``,
    `Tone: ${tone}. ${PROFILE.tone}`,
    ``,
    `Skills you can draw from (do not invent skills outside this list):`,
    skillsFlat,
    ``,
    `Archetypes — pick the one that best fits the scenario. Adapt the writing style to the archetype:`,
    archetypeList,
    ``,
    `Rules:`,
    ...PROFILE.rules.map((r, i) => `${i + 1}. ${r}`),
    ``,
    `Output strict JSON matching the provided schema. No surrounding text, no explanations, no markdown fences. The JSON object has: caption (string), field (string — which of my fields this fits), topic (string), archetype (string — which archetype you used), slides (array of {headline, body?}).`,
  ].join("\n");
}

export function buildUserPrompt(input: GenerateInput, recentTopics: string[]): string {
  const archetypeLine =
    input.archetype === "auto"
      ? `Archetype: you pick — choose the one that best fits the scenario.`
      : `Archetype: ${input.archetype} (forced — write in this style even if the scenario fits another archetype better).`;

  const recentLine =
    recentTopics.length > 0
      ? `Avoid these recent topics (I've already written about them): ${recentTopics.join("; ")}.`
      : `No recent topics to avoid — this is the first post.`;

  return [
    `Scenario: ${input.scenario}`,
    ``,
    archetypeLine,
    recentLine,
    `Length: ${input.slideCount} slides total.`,
    ``,
    `Write a LinkedIn carousel post in my style.`,
    `Format: ${input.slideCount} slides.`,
    `- Slide 1 = cover: a provocative hook headline only, no body text.`,
    `- Slides 2 to ${input.slideCount - 1} = one idea each: short bold headline + 2-4 sentences of body.`,
    `- Slide ${input.slideCount} = the takeaway + a specific question that drives comments.`,
    ``,
    `Also write a 3-4 line caption for the LinkedIn post body (the teaser that makes people swipe the carousel). End the caption with an arrow pointing down: ↓`,
    ``,
    `Set the "field" to whichever of my fields (${PROFILE.fields.join(", ")}) best fits the scenario, even if it's a stretch.`,
    `Set the "archetype" to whichever archetype you actually used.`,
    `Set the "topic" to a short specific topic label (e.g. "N+1 query problem", "first CTF lessons").`,
    ``,
    `Output ONLY the JSON object. No code fences. No commentary.`,
  ].join("\n");
}
