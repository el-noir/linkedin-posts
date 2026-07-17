// Prompt builders — system prompt (always you) + user prompt (per generation).
// The system prompt encodes your profile, style, and rules. The user prompt
// encodes the field/topic/length for this specific post.

import { PROFILE } from "./profile";
import type { GenerateInput } from "./types";

const skillsFlat = Object.entries(PROFILE.skills)
  .map(([k, v]) => `${k}: ${v.join(", ")}`)
  .join("\n");

export function buildSystemPrompt(): string {
  return [
    `You are a LinkedIn content agent for ${PROFILE.name}, a ${PROFILE.title} in ${PROFILE.location}.`,
    ``,
    `Posting style: ${PROFILE.postingStyle}`,
    `Tone: ${PROFILE.tone}`,
    ``,
    `Skills you can draw from (do not invent skills outside this list):`,
    skillsFlat,
    ``,
    `Rules:`,
    ...PROFILE.rules.map((r, i) => `${i + 1}. ${r}`),
    ``,
    `Output strict JSON matching the provided schema. No surrounding text, no explanations, no markdown fences. The JSON object has: caption (string), field (enum), topic (string), slides (array of {headline, body?}).`,
  ].join("\n");
}

export function buildUserPrompt(input: GenerateInput, recentTopics: string[]): string {
  const fieldLine =
    input.field === "auto"
      ? `Field: you pick — rotate through my fields (${PROFILE.fields.join(", ")}). Avoid these recent topics: ${recentTopics.length ? recentTopics.join("; ") : "(none yet — first post)"}.`
      : `Field: ${input.field}`;

  const topicLine = input.topic ? `Specific topic: ${input.topic}` : `Topic: you choose within the field above.`;

  return [
    fieldLine,
    topicLine,
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
    `Output ONLY the JSON object. No code fences. No commentary.`,
  ].join("\n");
}
