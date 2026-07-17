// Zod schemas — the contract between GLM-5.2's output and the renderer.
// If GLM returns bad shape, parseStructured() retries once, then errors clearly.

import { z } from "zod";

export const SlideSchema = z.object({
  headline: z
    .string()
    .min(2)
    .max(120)
    .describe("A short bold headline, 2-5 words. Wrap with \\n for line breaks if needed."),
  body: z
    .string()
    .max(600)
    .optional()
    .describe("2-4 sentences of body text. Omit on the cover slide. Use \\n for paragraph breaks."),
});

export const PostSchema = z.object({
  caption: z
    .string()
    .min(20)
    .max(500)
    .describe("A 3-4 line teaser for the LinkedIn post body. Ends with an arrow ↓ to point at the carousel."),
  field: z
    .string()
    .describe("Which of the author's fields this post belongs to."),
  topic: z
    .string()
    .min(2)
    .max(120)
    .describe("The specific topic of this post, e.g. 'N+1 query problem' or 'prompt injection'."),
  slides: z
    .array(SlideSchema)
    .min(5)
    .max(8)
    .describe("The carousel slides. Slide 1 is the cover (headline only, no body). Last slide is the takeaway + question."),
});

export type Slide = z.infer<typeof SlideSchema>;
export type Post = z.infer<typeof PostSchema>;

// What the UI sends to the generate endpoint
export const GenerateInputSchema = z.object({
  field: z
    .enum(["auto", "AI / LLM engineering", "Full-stack / backend", "Dev productivity / tooling", "Career / SWE lessons"])
    .default("auto"),
  topic: z.string().max(120).optional(),
  slideCount: z.number().int().min(5).max(8).default(6),
});

export type GenerateInput = z.infer<typeof GenerateInputSchema>;
