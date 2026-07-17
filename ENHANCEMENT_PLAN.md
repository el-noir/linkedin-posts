# Enhancement Plan — Scenario Input + Creativity Upgrades

Build order is sequenced by dependency. Each phase is independently shippable.

---

## Phase 1 — Scenario Input + Archetypes (the core upgrade)

**Goal:** Replace `field + topic` with a single free-text scenario. The agent picks the right post archetype from the scenario, not a fixed "Problem → solution."

**Why first:** Every other enhancement depends on the scenario input being there. Also the biggest unlock for creativity — the current lock to "Problem → solution" kills non-technical posts.

### Changes

**`src/lib/types.ts`** — add archetypes
```ts
export const ARCHETYPES = [
  "auto",            // agent picks
  "problem-solution",
  "story-lesson",
  "contrarian",
  "listicle",
  "myth-busting",
  "behind-the-scenes",
] as const;
export type Archetype = (typeof ARCHETYPES)[number];

export const GenerateInputSchema = z.object({
  scenario: z.string().max(500).describe("Free-text scenario. Anything — technical, personal, opinion, listicle."),
  archetype: z.enum(ARCHETYPES).default("auto"),
  tone: z.enum(["direct", "casual", "authoritative", "provocative", "reflective"]).default("direct"),
  slideCount: z.number().int().min(5).max(8).default(6),
});
```

Drop `field` from `GenerateInput` — it's now derived by the agent from the scenario, not picked by the user. Keep `field` on `Post` for history/filtering.

**`src/lib/prompts.ts`** — archetype-aware system + user prompts
- New `buildSystemPrompt()` adds: "Pick the archetype that best fits the scenario. Archetypes: …"
- New `buildUserPrompt(input, recentTopics)` includes the scenario verbatim + the chosen archetype (or "auto" → agent picks + returns it in JSON)
- `PostSchema` gains `archetype` field so the UI shows what was picked

**`src/lib/profile.ts`** — relax the rules
- Replace `postingStyle: "Problem → How I'd solve it"` with `postingStyles: { archetype → description }` map
- Add: "Adapt the style to the archetype. A contrarian take is sharp and opinionated; a story is reflective and specific; a listicle is punchy and scannable."

**`src/app/page.tsx`** — new form
- Replace the `Field` dropdown + `Topic` input with a single `<textarea>` for the scenario
- Add `Archetype` dropdown (default "auto")
- Add `Tone` dropdown (default "direct")
- Keep `Slides` selector
- Show the picked archetype in the editor header once generated

**Estimate:** 45 min

---

## Phase 2 — A/B Cover Generation

**Goal:** Generate 3 cover headline variants. You pick. The cover drives ~80% of swipes.

**Why second:** Biggest engagement lever. Cheap to build (one extra LLM call with a small schema).

### Changes

**`src/lib/types.ts`** — new endpoint schema
```ts
export const CoverVariantsSchema = z.object({
  variants: z.array(z.object({
    headline: z.string().max(120),
    rationale: z.string().max(200).describe("Why this hook works for this scenario + archetype"),
  })).min(3).max(3),
});
```

**`src/agent/generate-covers.ts`** — new function
- `generateCovers(scenario, archetype, tone) → Result<CoverVariants>`
- One GLM-5.2 call, small `max_tokens` (~800), fast
- Prompt: "Write 3 cover headline variants for this scenario. Each must be ≤ 8 words, provocative, swipeable. No two variants share the same angle (e.g. one bold claim, one question, one contrarian)."

**`src/app/api/covers/route.ts`** — new endpoint
- `POST { scenario, archetype, tone }` → returns 3 variants

**`src/app/page.tsx`** — cover picker UI
- After full post generation, fire the covers call in parallel
- Show 3 variants as cards above the slide editor
- Click one → updates slide 1's headline
- "Regenerate covers" button

**Estimate:** 30 min

---

## Phase 3 — Regenerate Single Slide

**Goal:** If slide 4 is weak, regenerate just that one — not the whole post.

**Why third:** Saves tokens + time when only one slide needs work. Pairs naturally with the A/B covers (covers are just a specialized version of this).

### Changes

**`src/agent/regenerate-slide.ts`** — new function
- `regenerateSlide(post, slideIdx, instruction?) → Result<Slide>`
- Prompt includes the full post as context + the slide to regenerate + an optional instruction ("make it punchier", "shorter", "add a specific example")
- Returns just the new slide

**`src/app/api/regenerate-slide/route.ts`** — new endpoint
- `POST { post, slideIdx, instruction? }` → returns one slide

**`src/app/page.tsx`** — per-slide regenerate button
- Each slide card gets a "↻ Regenerate" button
- Optional inline instruction input ("punchier", "shorter", etc.)
- On click: calls endpoint, replaces just that slide

**Estimate:** 25 min

---

## Phase 4 — Hook Strength Score (self-critique)

**Goal:** After generating, the agent rates its own cover 1-10 + suggests 2 improvements. Meta but sharpens the output.

**Why fourth:** Uses the same covers endpoint infrastructure. No new architecture — one more small LLM call.

### Changes

**`src/lib/types.ts`** — score schema
```ts
export const CoverScoreSchema = z.object({
  score: z.number().min(1).max(10),
  strengths: z.array(z.string()).max(2),
  improvements: z.array(z.string()).max(2),
});
```

**`src/agent/score-cover.ts`** — new function
- `scoreCover(headline, scenario, archetype) → Result<CoverScore>`
- Prompt: "Rate this LinkedIn carousel cover headline 1-10 for swipe-triggering power. Be harsh. Then give 2 strengths + 2 concrete improvements."

**`src/app/page.tsx`** — score badge
- Show the score next to the current cover (e.g. "Hook strength: 7/10")
- Click to expand → see strengths + improvements
- "Apply an improvement" button → runs `regenerateSlide` with the improvement as instruction

**Estimate:** 20 min

---

## Phase 5 — Tone Slider (optional, do if time)

**Goal:** Direct / Casual / Authoritative / Provocative / Reflective. Currently locked to "direct."

**Why last:** Smallest unlock — the scenario + archetype already steer tone implicitly. But explicit control is nice for users who want to experiment.

### Changes

- `tone` already in `GenerateInputSchema` from Phase 1
- `buildSystemPrompt()` adds: "Tone: {tone}. Direct = no fluff. Casual = conversational. Authoritative = declarative. Provocative = sharp, slightly contrarian. Reflective = personal, slower pace."
- UI: tone dropdown in the form

**Estimate:** 10 min (mostly done in Phase 1)

---

## What I'm NOT planning (deferred)

| Enhancement | Why deferred |
|---|---|
| Two-pass draft → polish | Doubles cost + latency for modest quality gain. Wait until you've used the agent for a week and can tell if quality is the bottleneck. |
| Voice matching | Needs 3-5 of your existing posts. Collect them first, then build this. |
| History analytics | Needs you to log likes/comments manually for a few weeks first. No data = no learning. |
| Auto-post to LinkedIn | OAuth + LinkedIn API complexity. Not worth it until you're posting daily. |
| Topic research mode | First agentic step. Build after the core loop is solid. |
| Comment seeding | Effective but slightly controversial. Skip for now. |
| Carousel vs text toggle | Most of your scenarios want carousel format. Add only if you find yourself forcing non-carousel scenarios into the format. |

---

## Build Order

| Phase | What | Estimate | Cumulative |
|---|---|---|---|
| 1 | Scenario + archetypes | 45 min | 45 min |
| 2 | A/B cover generation | 30 min | 1h 15m |
| 3 | Regenerate single slide | 25 min | 1h 40m |
| 4 | Hook strength score | 20 min | 2h |
| 5 | Tone slider | 10 min | 2h 10m |

**Total: ~2 hours 10 minutes for all 5.**

Each phase is shippable on its own. I'll commit after each.

---

## New File Structure (additions)

```
src/
├── agent/
│   ├── generate.ts           (existing — updated for archetypes)
│   ├── generate-covers.ts    (new — Phase 2)
│   ├── regenerate-slide.ts   (new — Phase 3)
│   └── score-cover.ts        (new — Phase 4)
├── app/
│   ├── api/
│   │   ├── generate/route.ts        (existing — updated)
│   │   ├── covers/route.ts          (new — Phase 2)
│   │   ├── regenerate-slide/route.ts(new — Phase 3)
│   │   └── score-cover/route.ts     (new — Phase 4)
│   └── page.tsx                     (existing — updated each phase)
└── lib/
    ├── types.ts                     (updated — archetypes, tone, cover/score schemas)
    ├── prompts.ts                   (updated — archetype-aware prompts)
    └── profile.ts                   (updated — relaxed rules for archetypes)
```

---

## Confirm before I start

1. **Archetypes list** — the 6 I listed (problem-solution, story-lesson, contrarian, listicle, myth-busting, behind-the-scenes) — add/remove any?
2. **Tone options** — direct/casual/authoritative/provocative/reflective — okay?
3. **Build all 5 phases or stop after a specific one?**
4. **Auto-rotate fields** — drop entirely (scenario implies the field) or keep as a fallback when scenario is empty?

Say "go on phases 1-5" (or pick) and I build. Default archetypes + tones as listed, auto-rotate dropped (scenario required).
