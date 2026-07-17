// Shared Anthropic client + structured-output helper.
// Ported from sysreptor/src/lib/anthropic.ts — same two-mode auth (direct
// Claude or LiteLLM proxy), same native-then-fallback pattern, simplified
// for our single-object schema (no array unwrapping needed).
//
// Auth (auto-detected from env):
//   1. Direct Claude:  ANTHROPIC_API_KEY (no base URL override)
//   2. Proxy (LiteLLM): ANTHROPIC_AUTH_TOKEN + ANTHROPIC_BASE_URL + ANTHROPIC_MODEL
//
// Switch to real Claude later: set ANTHROPIC_API_KEY, unset proxy vars — no code changes.

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Result } from "./result";

// Creates an Anthropic client from environment variables.
export function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
  const baseURL = process.env.ANTHROPIC_BASE_URL;

  if (!apiKey && !authToken) {
    throw new Error(
      "No LLM auth configured. Set ANTHROPIC_API_KEY for direct Claude, " +
        "or ANTHROPIC_AUTH_TOKEN + ANTHROPIC_BASE_URL for a proxy (e.g. LiteLLM).",
    );
  }

  return new Anthropic({
    ...(apiKey ? { apiKey } : {}),
    ...(authToken ? { authToken } : {}),
    ...(baseURL ? { baseURL } : {}),
  });
}

export function getModel(fallback = "zai-org/GLM-5.2"): string {
  return process.env.ANTHROPIC_MODEL ?? fallback;
}

function nativeStructuredOutputsEnabled(): boolean {
  return process.env.ANTHROPIC_NATIVE_STRUCTURED_OUTPUTS !== "false";
}

// Extract JSON from a text response. Handles markdown code fences + bare JSON.
function extractJsonFromText(text: string): string | null {
  const codeBlock = text.match(/```(?:json)?\s*\n([\s\S]*?)\n\s*```/);
  if (codeBlock) return codeBlock[1].trim();
  const obj = text.match(/\{[\s\S]*\}/);
  return obj ? obj[0] : null;
}

type StructuredCallParams = {
  model: string;
  max_tokens: number;
  system?: string;
  messages: Anthropic.MessageParam[];
};

// Calls the model with a Zod schema. Tries native structured outputs first
// (works with real Claude + proxies that translate output_config.format);
// falls back to manual JSON extraction + Zod parse if the proxy ignores it.
// Retries once on JSON parse failure with a "fix your JSON" reminder.
export async function parseStructured<Schema extends z.ZodType>(
  client: Anthropic,
  params: StructuredCallParams,
  schema: Schema,
): Promise<Result<z.infer<Schema>>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await parseStructuredAttempt(client, params, schema, attempt);
    if (result.ok) return result;
    const isRetryable =
      result.error.includes("JSON parse failed") ||
      result.error.includes("No JSON found") ||
      result.error.includes("Zod");
    if (attempt === 0 && isRetryable) continue;
    return result;
  }
  return parseStructuredAttempt(client, params, schema, 1);
}

async function parseStructuredAttempt<Schema extends z.ZodType>(
  client: Anthropic,
  params: StructuredCallParams,
  schema: Schema,
  attempt: number,
): Promise<Result<z.infer<Schema>>> {
  const tryNative = nativeStructuredOutputsEnabled();

  const systemPrompt =
    attempt > 0 && params.system
      ? `${params.system}\n\nIMPORTANT: Your previous response contained invalid JSON. Output ONLY valid JSON matching the schema. No surrounding text, no explanations. Ensure all strings are properly escaped.`
      : params.system;

  // --- Primary: native structured outputs (streamed, supports long requests) ---
  if (tryNative) {
    try {
      const stream = client.messages.stream({
        model: params.model,
        max_tokens: params.max_tokens,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: params.messages,
        output_config: { format: zodOutputFormat(schema) },
      });
      const message = await stream.finalMessage();
      if (message.parsed_output !== null) {
        return { ok: true, data: message.parsed_output };
      }
    } catch {
      // Proxy rejected output_config, or streaming failed — fall through.
    }
  }

  // --- Fallback: plain text → extract JSON → Zod parse ---
  let text: string;
  try {
    const message = await client.messages.create({
      model: params.model,
      max_tokens: params.max_tokens,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: params.messages,
    });
    text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  const jsonStr = extractJsonFromText(text);
  if (!jsonStr) {
    return { ok: false, error: "No JSON found in model response" };
  }

  try {
    const result = schema.safeParse(JSON.parse(jsonStr));
    if (result.success) {
      return { ok: true, data: result.data };
    }
    return {
      ok: false,
      error: `Zod validation failed: ${result.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    };
  } catch (err) {
    return {
      ok: false,
      error: `JSON parse failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
