# LinkedIn Post Agent — Plan

A Next.js web app that generates LinkedIn carousel posts: calls GLM-5.2 (via Vultr, through a LiteLLM proxy) with your profile + a topic, returns editable slide text + caption, and builds the carousel PDF for upload.

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Browser (you, daily)                                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Next.js App (frontend + backend)                     │    │
│  │                                                        │    │
│  │  [Generate] → API route → @anthropic-ai/sdk            │    │
│  │      ↓                        (Anthropic Messages)     │    │
│  │  [Edit slides] → preview       ↓                       │    │
│  │      ↓                  localhost:4000 (LiteLLM)       │    │
│  │  [Build PDF] → @react-pdf/renderer                      │    │
│  │      ↓                       ↓ (translates to OpenAI)  │    │
│  │  [Download] → upload to LinkedIn  https://api.vultr…   │    │
│  │                                          ↓              │    │
│  │                                  zai-org/GLM-5.2        │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**Flow:** Open app → (optionally pick field/topic) → click Generate → GLM-5.2 writes the post (caption + slides) through the LiteLLM translation layer → you review/edit inline → click Build PDF → download → upload to LinkedIn as a document post.

The Anthropic SDK call (`client.messages.create()` + `zodOutputFormat()`) is sent to `localhost:4000`. LiteLLM translates it to OpenAI Chat Completions and forwards to Vultr. Your code stays Anthropic-shaped — switching to real Claude later means setting `ANTHROPIC_API_KEY` and unsetting `ANTHROPIC_BASE_URL`, with zero code changes. (Pattern copied from your `sysreptor` project.)

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router, TypeScript)** | Full-stack, one project, your stack |
| LLM client | **@anthropic-ai/sdk** | Talks to LiteLLM proxy (Anthropic-shaped calls → GLM-5.2). Same SDK you use in sysreptor. |
| LLM (actual) | **zai-org/GLM-5.2 via Vultr** | Your choice — accessed through LiteLLM translation layer |
| Proxy | **LiteLLM** (`litellm --config litellm_config.yaml`) | Translates Anthropic Messages API → OpenAI Chat Completions → Vultr |
| Schema validation | **zod** | Validate GLM's JSON output before rendering |
| PDF generation | **@react-pdf/renderer** | Define slides as React components → render to PDF. Port of the v6 design. |
| Styling | **Tailwind CSS** | Fast UI |
| Fonts | **Fraunces** (serif headlines) + **Inter** (sans body) | Bundled with `@fontsource/*` — matches the v6 mockup |
| Storage | **JSON files in `posts/` dir** | No DB. Each post = one JSON file. |

**No auth, no scheduler, no DB.** JSON files for history. LiteLLM runs separately in a terminal.

---

## 3. Project Structure

```
D:\Linkedin-Posts\
├── package.json
├── next.config.ts
├── tsconfig.json
├── .env.example              # ANTHROPIC_AUTH_TOKEN + ANTHROPIC_BASE_URL + ANTHROPIC_MODEL=zai-org/GLM-5.2
├── .env.local                # your real token (gitignored)
├── .gitignore                # includes litellm_config.yaml, .env*, posts/, *.pdf
├── litellm_config.yaml        # maps zai-org/GLM-5.2 → Vultr endpoint (gitignored)
├── README.md                  # setup: LiteLLM + dev server
├── PLAN.md                    # this file
├── LinkedIn_Content_Kit.md    # existing reference
├── reference/                 # existing Nick Saraev slides
├── theme_mockups/             # v6 mockups (design spec)
├── fonts/                     # Fraunces + Inter TTFs (bundled)
├── posts/                     # generated posts (one JSON per post, gitignored)
│   └── 2026-07-18-n-plus-1-queries.json
└── src/
    ├── app/
    │   ├── layout.tsx          # root + Tailwind + font imports
    │   ├── page.tsx            # main UI: form → generate → edit → download
    │   └── api/
    │       ├── generate/route.ts   # POST → generatePost(input) → Post
    │       ├── save/route.ts       # POST → write post JSON
    │       ├── list/route.ts       # GET → list saved posts
    │       └── pdf/route.ts        # POST → render PDF (stream)
    ├── lib/
    │   ├── anthropic.ts        # createAnthropicClient() + parseStructured() (ported from sysreptor)
    │   ├── result.ts           # { ok, data?, error? } type
    │   ├── profile.ts          # YOUR skills/resume/tone (constant sent to LLM)
    │   ├── prompts.ts          # system + user prompt builders
    │   ├── post-store.ts       # read/write JSON in posts/
    │   └── types.ts            # PostSchema (Zod) + TypeScript types
    ├── agent/
    │   └── generate.ts         # generatePost(input) → Result<Post> (the brain)
    └── render/
        ├── Slide.tsx            # one slide as @react-pdf/renderer component
        ├── CarouselPdf.tsx      # all slides → <Document>
        └── theme.ts             # palette + fonts + spacing constants (v6 spec)
```

---

## 4. The LiteLLM Translation Layer (copied from sysreptor)

### `litellm_config.yaml`

```yaml
model_list:
  - model_name: zai-org/GLM-5.2
    litellm_params:
      model: openai/zai-org/GLM-5.2
      api_base: https://api.vultrinference.com/v1
      api_key: os.environ/ANTHROPIC_AUTH_TOKEN

litellm_settings:
  disable_auth: true
```

### `.env.example`

```bash
# Mode B — Proxy / LiteLLM (testing with Vultr GLM-5.2):
ANTHROPIC_AUTH_TOKEN=your-vultr-key
ANTHROPIC_BASE_URL=http://localhost:4000
ANTHROPIC_MODEL=zai-org/GLM-5.2

# Mode A (uncomment for direct Claude later — zero code changes):
# ANTHROPIC_API_KEY=sk-ant-...
```

### `src/lib/anthropic.ts` (ported from sysreptor, simplified)

Exports `createAnthropicClient()`, `getModel()`, and `parseStructured()`. Same two-mode auth (direct Claude or LiteLLM proxy). Same native structured outputs → manual Zod parse fallback. Same JSON repair for truncated output. Dropped the `directMessagesCreate` fallback (not needed — our `max_tokens` stays small, ~4000). Dropped the `extractJsonFromText` complexity for arrays (our schema is a single object, not array-wrapped).

```ts
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Result } from "./result";

export function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
  const baseURL = process.env.ANTHROPIC_BASE_URL;
  if (!apiKey && !authToken) throw new Error("No LLM auth configured (see .env.example)");
  return new Anthropic({
    ...(apiKey ? { apiKey } : {}),
    ...(authToken ? { authToken } : {}),
    ...(baseURL ? { baseURL } : {}),
  });
}

export function getModel(fallback = "zai-org/GLM-5.2"): string {
  return process.env.ANTHROPIC_MODEL ?? fallback;
}

export async function parseStructured<Schema extends z.ZodType>(
  client: Anthropic,
  params: { model: string; max_tokens: number; system?: string; messages: Anthropic.MessageParam[] },
  schema: Schema,
): Promise<Result<z.infer<Schema>>> {
  // Try native structured outputs first (works with real Claude + proxies that pass it through)
  try {
    const stream = client.messages.stream({
      model: params.model,
      max_tokens: params.max_tokens,
      ...(params.system ? { system: params.system } : {}),
      messages: params.messages,
      output_config: { format: zodOutputFormat(schema) },
    });
    const message = await stream.finalMessage();
    if (message.parsed_output !== null) return { ok: true, data: message.parsed_output };
  } catch { /* proxy rejected output_config — fall through to manual parse */ }

  // Fallback: plain text response → extract JSON → Zod parse
  const message = await client.messages.create({
    model: params.model,
    max_tokens: params.max_tokens,
    ...(params.system ? { system: params.system } : {}),
    messages: params.messages,
  });
  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text).join("");

  // Extract JSON from text (handles code fences + bare JSON)
  const jsonMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n\s*```/) ?? text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { ok: false, error: "No JSON found in model response" };
  const jsonStr = jsonMatch[1] ?? jsonMatch[0];

  try {
    const result = schema.safeParse(JSON.parse(jsonStr));
    return result.success ? { ok: true, data: result.data } : { ok: false, error: `Zod: ${result.error.issues.map(i => i.message).join("; ")}` };
  } catch (err) {
    return { ok: false, error: `JSON parse failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}
```

**Why port this exactly:** you already use it in sysreptor. Same auth, same fallback, same retry shape. When you switch to real Claude, the native path just works (no translation needed).

---

## 5. GUARANTEE: It Generates the Posts You Want

This is the explicit contract. The agent will produce what you want because five layers enforce it:

### Layer 1 — Your profile is baked in (`src/lib/profile.ts`)

```ts
export const PROFILE = {
  name: "Mudasir Shah",
  title: "Full-Stack Developer & AI Integration Engineer",
  location: "Islamabad, Pakistan",
  fields: ["AI / LLM engineering", "Full-stack / backend", "Dev productivity / tooling", "Career / SWE lessons"],
  skills: {
    languages: ["Python", "JavaScript (ES6+)", "TypeScript", "Bash"],
    backend:  ["FastAPI", "Node.js", "NestJS", "RESTful APIs", "Redis", "WebSockets"],
    databases: ["PostgreSQL", "MongoDB", "Prisma ORM", "Qdrant"],
    ai: ["OpenAI", "Claude", "Claude Agent SDK", "LangChain", "RAG"],
    frontend: ["React.js", "Next.js", "Tailwind CSS"],
    tools: ["Git", "Docker", "CI/CD", "Linux", "AWS"],
  },
  achievements: ["CTF Finalist — Black Hat MEA 2025", "5th of 600+ — Vyrothon 2026 AI Hackathon"],
  postingStyle: "Problem → How I'd solve it. Practical, opinionated, ends with a specific question.",
  tone: "Direct, technical, no hype. Like a senior engineer explaining to a peer.",
  rules: [
    "Never invent personal experience. Write about general engineering problems — not your projects.",
    "Each slide has ONE idea. Body text ≤ 4 lines.",
    "Cover = a provocative hook (≤ 8 words). Closing = a question + save prompt.",
    "Use smart quotes, em-dashes, ellipsis. No straight quotes, no hyphens-as-dashes.",
    "End every post with a specific question that drives comments.",
  ],
};
```

This is sent to GLM-5.2 on every call. It can't forget your style.

### Layer 2 — The Zod schema enforces the shape (`src/lib/types.ts`)

```ts
export const SlideSchema = z.object({
  headline: z.string().max(80).describe("2-5 words, bold"),
  body: z.string().max(280).optional().describe("2-4 sentences. Omit on cover."),
});
export const PostSchema = z.object({
  caption: z.string().max(220).describe("3-4 line teaser for the LinkedIn post body"),
  field: z.enum(["AI / LLM engineering", "Full-stack / backend", "Dev productivity / tooling", "Career / SWE lessons"]),
  topic: z.string().max(80).describe("the specific topic"),
  slides: z.array(SlideSchema).min(5).max(8),
});
```

GLM-5.2's output is validated against this before the UI renders. If it returns bad shape, `parseStructured` retries once with a "fix your JSON" reminder, then errors clearly.

### Layer 3 — The prompt steers the format (`src/lib/prompts.ts`)

**System prompt** (always sent):
> You are a LinkedIn content agent for {PROFILE.name}, a {PROFILE.title} in {PROFILE.location}.
> Posting style: {PROFILE.postingStyle}. Tone: {PROFILE.tone}.
> Skills you can draw from: {skills}.
> Rules:
> {PROFILE.rules joined}
> Output strict JSON matching the provided schema. No surrounding text.

**User prompt** (per generation):
> {field or "you pick — rotate through my fields, avoid these recent topics: {last 5}"}
> {optional topic, e.g. "prompt injection"}
> Write a LinkedIn carousel post in my style.
> Format: {slide count} slides. Slide 1 = cover (provocative hook). Slides 2..n-1 = one idea each (short headline + 2-4 sentences). Last slide = takeaway + a specific question.
> Also write a 3-4 line caption for the post body (the teaser).

### Layer 4 — You steer each generation (the UI form)

```
Field:   [Auto-rotate ▾]   ← dropdown: Auto, AI/LLM, Full-stack, Dev productivity, Career
Topic:   [______________]  ← optional free text, e.g. "prompt injection"
Length:  [6 slides ▾]      ← 5 / 6 / 7 / 8
                            [Generate]
```

- Pick a field + topic → GLM-5.2 writes that post
- Leave blank → auto-rotates through your 4 fields, avoiding the last 5 topics saved in `posts/`
- You always see and can edit every slide before building the PDF

### Layer 5 — The design is baked into the renderer (`src/render/`)

The PDF builder uses the **exact v6 design** you locked:
- Palette: warm cream `#FAF8F3`, warm near-black `#1F1B16`, 6 color-coded section accents
- Fonts: Fraunces Bold (headlines) + Inter Regular/SemiBold (body/labels)
- Layout: 5% margins, progress bar, label + slide number, headline, accent rule, body, footer locked to identical pixels
- **Text wrapping:** `@react-pdf/renderer` wraps natively, so the overflow bug you saw can't happen

No matter what GLM-5.2 returns, the PDF always looks like the v6 mockup.

### What you get, every time

1. A 5-8 slide carousel in your "Problem → How I'd solve it" style
2. In one of your 4 fields (auto-rotated or picked)
3. With your voice (direct, technical, no hype)
4. A caption for the post body
5. A closing slide with a specific question
6. A PDF in the v6 design, ready to upload
7. The post saved to `posts/` so the next generation avoids repeats

If any slide is wrong, you edit it inline before building the PDF. You never post anything GLM-5.2 wrote without reviewing it.

---

## 6. The Design Spec (v6, baked into `src/render/theme.ts`)

```ts
export const PALETTE = {
  bg:      "#FAF8F3",   // warm cream
  text:    "#1F1B16",   // warm near-black
  muted:   "#6E665B",   // warm gray
  divider: "#E8E1D4",   // warm hairline
};
export const SECTION_COLORS = [
  "#A0502E", "#B8860B", "#6B3D8B", "#1E6343", "#166B6B", "#8B2C38",
];
export const FONTS = { headline: "Fraunces-Bold", body: "Inter-Regular", label: "Inter-SemiBold" };
export const LAYOUT = {
  width: 1080, height: 1350,
  margin: 72, contentW: 936,
  progressBarY: 50, headerY: 130,
  headlineY: 320, gapHeadRule: 40, gapRuleBody: 60,
  bodyLineH: 56, bodyGap: 24,
  footerDividerY: 1220, footerTextY: 1255,
};
export const FOOTER = { name: "Mudasir Shah", title: "Full-Stack & AI Engineer" };
```

`Slide.tsx` renders one `<Page>` from these constants. Same on every slide. Same as the v6 mockup you locked.

---

## 7. Daily Workflow

1. In one terminal: `litellm --config litellm_config.yaml` (port 4000)
2. In another: `npm run dev` (port 3000)
3. Open `http://localhost:3000`
4. (Optional) pick a field or type a topic → click **Generate**
5. Review the 6 slides + caption → edit anything inline
6. Click **Build PDF** → download
7. LinkedIn → Create post → document icon → upload PDF → paste caption → post
8. The post auto-saves to `posts/` (so next time avoids this topic)

**Daily effort: ~5 minutes.**

---

## 8. Agentic Future (designed for, not built yet)

The architecture keeps the brain swappable. `src/agent/generate.ts` is a single function `generatePost(input) → Result<Post>`. Today it does one GLM-5.2 call. Later upgrades:

| Upgrade | What you add | Effort |
|---|---|---|
| Multi-step planning | Call #1 = outline, call #2 = write slides. Both inside `generatePost()`. | 1 hr |
| Topic research (web search) | Add `tools.ts` with a search tool. GLM-5.2 tool use API. | 2 hr |
| LangGraph orchestration | Swap the calls inside `generatePost()` for a LangGraph graph. Same return type. | 3 hr |
| Claude Agent SDK | Wrap `generatePost()` in an agent loop with human-in-the-loop review. (You already know this from sysreptor Phase 2.) | 2 hr |
| Daily auto-run | Add `/api/cron` route → calls `generatePost()` + render + save. No UI. | 1 hr |
| Switch to real Claude | Set `ANTHROPIC_API_KEY`, unset `ANTHROPIC_BASE_URL`. Zero code changes. | 0 min |

Because `generatePost()` returns a typed `Post` and the renderer is separate, you can replace the brain without touching the UI or PDF.

---

## 9. What I Need to Start Building

1. **Confirm this plan** — say "go" and I scaffold + build
2. **Your Vultr API key** — drop it in `.env.local` yourself (I'll gitignore it + create `.env.example` with placeholders)
3. **Defaults locked:** model=`zai-org/GLM-5.2`, field=auto-rotate, length=6 slides, tone=direct, design=v6 light editorial. Okay?

Say "go" and I'll:
1. Scaffold the Next.js app
2. Copy `litellm_config.yaml` + `.env.example` from your sysreptor pattern
3. Port `src/lib/anthropic.ts` (simplified)
4. Build `src/lib/profile.ts` with your resume
5. Build `src/lib/types.ts` (Zod schema)
6. Build `src/agent/generate.ts`
7. Build `src/render/` (v6 design → @react-pdf/renderer)
8. Build the UI (form + editor + preview + download)
9. Wire up the API routes
10. Test end-to-end — you generate your first post

Total build time: ~3-4 hours.
