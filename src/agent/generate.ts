// The brain — generatePost(input) → Result<Post>.
// Today: one GLM-5.2 call (via LiteLLM proxy). Tomorrow: swap for an agent
// loop, LangGraph graph, or real Claude — same return type, UI unchanged.

import { createAnthropicClient, getModel, parseStructured } from "@/lib/anthropic";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { PostSchema, type GenerateInput, type Post } from "@/lib/types";
import { PROFILE } from "@/lib/profile";
import { recentTopics } from "@/lib/post-store";
import type { Result } from "@/lib/result";

// Normalize GLM's field string to one of the canonical fields (fuzzy match).
function normalizeField(raw: string): string {
  const lower = raw.toLowerCase();
  const match = PROFILE.fields.find((f) => lower.includes(f.toLowerCase().split("/")[0].trim()));
  return match ?? raw;
}

export async function generatePost(input: GenerateInput): Promise<Result<Post>> {
  const client = createAnthropicClient();
  const model = getModel("zai-org/GLM-5.2");
  const topics = await recentTopics(5);

  const system = buildSystemPrompt(input.tone);
  const user = buildUserPrompt(input, topics);

  const result = await parseStructured(
    client,
    {
      model,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: user }],
    },
    PostSchema,
  );

  if (result.ok) {
    return { ok: true, data: { ...result.data, field: normalizeField(result.data.field) } };
  }
  return result;
}
