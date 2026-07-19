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

const TONE_DESCRIPTIONS: Record<string, string> = {
  direct: "Direct = no fluff, no hedging, no filler words. Get to the point in the first sentence.",
  casual: "Casual = conversational, like talking to a friend over coffee. Contractions are fine. Lighter tone.",
  authoritative: "Authoritative = declarative, confident, no hedging. State things as facts. You're the expert.",
  provocative: "Provocative = sharp, slightly contrarian, makes the reader slightly uncomfortable. Push the angle.",
  reflective: "Reflective = personal, slower pace, more storytelling. Think out loud. Let the reader sit with it.",
};

export function buildSystemPrompt(tone: string): string {
  const toneDesc = TONE_DESCRIPTIONS[tone] ?? TONE_DESCRIPTIONS.direct;
  return [
    `You are a LinkedIn content agent for ${PROFILE.name}, a ${PROFILE.title} in ${PROFILE.location}.`,
    ``,
    `Tone: ${tone}. ${toneDesc} ${PROFILE.tone}`,
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
      ? `Archetype: you pick — choose the one that best fits the material.`
      : `Archetype: ${input.archetype} (forced — write in this style even if the material fits another archetype better).`;

  const recentLine =
    recentTopics.length > 0
      ? `Avoid these recent topics (I've already written about them): ${recentTopics.join("; ")}.`
      : `No recent topics to avoid — this is the first post.`;

  // Mode-specific instruction
  const modeInstruction =
    input.mode === "content"
      ? [
          `MODE: CONTENT EXTRACTION`,
          `The text below is source content. Turn it into a carousel — do NOT invent new ideas, do NOT add information that isn't in the source. Your job is to extract, structure, and sharpen what's already there.`,
          `If the content is long, distill it to the ${input.slideCount} strongest ideas. If it's short, expand each idea into a slide with context the author would obviously agree with — but stay faithful to the source.`,
          `Keep the author's original framing and opinions. Don't soften or contradict them.`,
          ``,
          `SOURCE CONTENT:`,
          input.scenario,
        ].join("\n")
      : [
          `MODE: SCENARIO`,
          `Scenario: ${input.scenario}`,
          `You write the content from scratch, in my voice, using the archetype style.`,
        ].join("\n");

  return [
    modeInstruction,
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
    `Set the "field" to whichever of my fields (${PROFILE.fields.join(", ")}) best fits, even if it's a stretch.`,
    `Set the "archetype" to whichever archetype you actually used.`,
    `Set the "topic" to a short specific topic label (e.g. "N+1 query problem", "first CTF lessons").`,
    ``,
    `Output ONLY the JSON object. No code fences. No commentary.`,
  ].join("\n");
}
