# LinkedIn Content Kit — Mudasir Shah

**Format:** Text-based PDF carousels (LinkedIn "document" posts) — the highest-reaching format on LinkedIn right now. Each post = a 6-10 slide deck where each slide is a bold headline + 2-4 sentences. Upload the PDF to LinkedIn; it displays as a swipeable carousel.

---

## 1. The Format (based on the reference posts you shared)

Both reference posts (Nick Saraev's "Guarantees" and Muhammad Musa's "5 MVP Mistakes") use the same format:

**What it is:**
- A multi-slide PDF uploaded to LinkedIn as a "document"
- LinkedIn renders it as a swipeable carousel in the feed
- Each slide = one page, portrait orientation (~1080×1350 or similar 4:5 ratio)
- The post caption is a short teaser; the carousel carries the real content

**Why it works:**
- LinkedIn's algorithm pushes document/carousel posts harder than text or single-image posts
- People swipe through multiple slides = more dwell time = more reach
- Text on slides gets read; text in captions gets skimmed
- It looks "premium" and effortful, so people hesitate to scroll past

**Anatomy of each slide (from Nick Saraev's 12-slide "Guarantees" carousel):**
1. **Cover slide** — one provocative hook line, huge font, your name + handle
2. **Body slides** — each has: a short bold sub-headline (2-5 words) + 2-4 sentences of body text + a consistent footer (your name + brand)
3. **Closing slide** — the takeaway / CTA

**The slide structure pattern:**
```
┌─────────────────────────────┐
│                             │
│   [Short bold headline]     │  ← 2-5 words, large font
│                             │
│   [2-4 sentences of body]   │  ← the actual content
│                             │
│                             │
│   Mudasir Shah  · handle    │  ← consistent footer on every slide
└─────────────────────────────┘
```

**Reference files saved:** `D:\Linkedin-Posts\reference\nick_slide_1.jpg` through `nick_slide_12.jpg` — open these to see the exact style. Note how clean and text-driven it is. Almost no illustration. Just great typography on a solid background.

---

## 2. Tools to Create These Carousels

These are NOT image generators. These are **design/layout tools** because the slides are primarily text.

### Option A — Fastest (recommended for starting)

| Tool | Why | Cost |
|---|---|---|
| **Canva** | Has ready-made "LinkedIn Carousel" templates. Drag your text in, export as PDF. Easiest path from text → carousel. | Free tier is enough |
| **Gamma.app** | AI generates the entire carousel from your text prompt. Writes headlines, lays out slides. Fastest end-to-end. | Free tier |
| **Figma** | Full control over fonts/colors/spacing. Build one template, duplicate for every post. | Free |

**My pick for you: Canva.** Search "LinkedIn carousel" in Canva templates → pick a clean minimal one → change colors to your brand (below) → paste your text → export as PDF. 15 minutes per post once you have a template.

### Option B — Python (automate the whole pipeline)

If you want to generate carousels from code (no manual design):

| Package | What it does | Install |
|---|---|---|
| `python-pptx` | Generate PowerPoint slides from code → export as PDF | `pip install python-pptx` |
| `reportlab` | Generate PDF directly with text, shapes, colors | `pip install reportlab` |
| `Pillow` (PIL) | Generate slide images (PNG/JPG) with text rendered on them | `pip install Pillow` |
| `pillow + pillow-heif` | Image generation + text overlay | `pip install Pillow` |

**Best Python approach:** Use `python-pptx` to generate a .pptx with one slide per carousel page, then export to PDF. LinkedIn accepts PDF. This lets you script all 6 posts in one run.

### Option C — AI-assisted design

| Tool | Why |
|---|---|
| **Gamma.app** | Type your post text → it generates a designed carousel automatically |
| **Canva Magic Design** | Paste text → Canva suggests a layout |
| **Beautiful.ai** | AI lays out slides from your content |

---

## 3. Your Visual Identity

Keep it simple — these carousels are text-first, so the "design" is really just: background color, font choice, and accent color.

| Element | Choice | Reason |
|---|---|---|
| Background | Deep charcoal `#0D1117` (GitHub dark) OR clean white `#FFFFFF` | Dark = developer brand; White = broader reach (both reference posts use light backgrounds) |
| Headline font | Bold sans-serif (Inter Bold, Geist Bold, or Canva's "Montserrat Bold") | Punchy, readable on mobile |
| Body font | Same family, regular weight, slightly smaller | Consistent |
| Accent color | Electric cyan `#22D3EE` (if dark bg) OR deep blue `#1E40AF` (if light bg) | Highlights key words/numbers |
| Footer | Name + "Mudasir Shah · Full-Stack & AI Engineer" | On every slide, small, bottom corner |
| Slide size | 1080×1350 px (4:5 portrait) | LinkedIn's optimal carousel size |

**Decision point:** Look at Nick Saraev's slides (the reference files). He uses a light/cream background with dark text. This is the safest high-performing style. If you want to match that exactly: white/cream bg, dark text, one accent color. If you want to stand out as a developer: dark bg, light text, cyan accent. Pick one and stay consistent.

---

## 4. The 6 Posts — Now as Carousels

Each post below is broken into **slides** ready to paste into Canva/Figma/Python. Each slide has a headline + body. The caption (post text) is the teaser that goes in the LinkedIn post body.

---

### POST 1 — LLM Hallucinations (AI/LLM engineering)

**LinkedIn caption (post body):**
> LLMs hallucinate.
> In a demo it's funny. In production it costs trust.
> Here's how I stop it before it reaches the user ↓

**Carousel slides (7 slides):**

**Slide 1 (Cover):**
- Headline: "When your AI lies — and how to stop it"
- Subtitle: 5 defenses that actually work
- Footer: Mudasir Shah · Full-Stack & AI Engineer

**Slide 2:**
- Headline: "The problem"
- Body: LLMs hallucinate. In a demo it's funny. In production it costs trust — one confident wrong answer to a customer and the credibility is gone.
- Footer: Mudasir Shah

**Slide 3:**
- Headline: "1. Grounding"
- Body: Retrieve real context with RAG and constrain the model to answer only from it. No context, no answer.
- Footer: Mudasir Shah

**Slide 4:**
- Headline: "2. Structured output"
- Body: Force JSON with a schema. No free-text escape hatch. The model fills fields, it doesn't ramble.
- Footer: Mudasir Shah

**Slide 5:**
- Headline: "3. Self-check"
- Body: A second LLM pass asks: "Is this supported by the retrieved context?" If not, it goes back.
- Footer: Mudasir Shah

**Slide 6:**
- Headline: "4. Confidence threshold"
- Body: If the retrieval score is low, default to "I don't know." Silence is better than a confident lie.
- Footer: Mudasir Shah

**Slide 7:**
- Headline: "5. Human in the loop"
- Body: For anything that touches money or a decision — a human signs off. Always.
- The goal isn't zero hallucination. That's impossible. The goal is: when it doesn't know, it says so.
- Footer: Mudasir Shah

---

### POST 2 — Prompt Injection (AI/LLM engineering)

**LinkedIn caption:**
> "Ignore previous instructions and…"
> That's the new SQL injection.
> Here's how I'd defend an LLM app ↓

**Carousel slides (7 slides):**

**Slide 1 (Cover):**
- Headline: "Prompt injection is the new SQL injection"
- Subtitle: How to defend your LLM app
- Footer: Mudasir Shah · Full-Stack & AI Engineer

**Slide 2:**
- Headline: "The attack"
- Body: Your LLM app takes user input. That input is now an attack surface. "Ignore previous instructions" is the new "OR 1=1."
- Footer: Mudasir Shah

**Slide 3:**
- Headline: "1. Isolate user input"
- Body: Never put user input in the system prompt. Treat it as data, not instructions. Two separate channels.
- Footer: Mudasir Shah

**Slide 4:**
- Headline: "2. Structured tools only"
- Body: The model can't run arbitrary code. It can only call whitelisted functions with validated parameters.
- Footer: Mudasir Shah

**Slide 5:**
- Headline: "3. Output validation"
- Body: Parse the output. Validate it against a schema. Reject if it breaks. Never trust the model's raw text.
- Footer: Mudasir Shah

**Slide 6:**
- Headline: "4. Least privilege"
- Body: The agent's API keys can only do what it must. Nothing more. Rate-limit and monitor for injection patterns.
- Footer: Mudasir Shah

**Slide 7:**
- Headline: "The rule"
- Body: Treat the prompt like a database query: assume it's hostile until validated.
- The model is powerful. User input is untrusted. Never let one write the other's instructions.
- Footer: Mudasir Shah

---

### POST 3 — N+1 Query Problem (Full-stack/backend)

**LinkedIn caption:**
> Your page loaded in 3s in dev.
> In production it loads in 30s. You changed nothing.
> Classic N+1. Here's the fix ↓

**Carousel slides (6 slides):**

**Slide 1 (Cover):**
- Headline: "The bug that's silently killing your API"
- Subtitle: N+1 queries, explained
- Footer: Mudasir Shah · Full-Stack & AI Engineer

**Slide 2:**
- Headline: "What happens"
- Body: 1 list view → 1 query for the list + N queries for each row's relation. 100 rows = 101 round trips to the database. Each one adds latency.
- Footer: Mudasir Shah

**Slide 3:**
- Headline: "Why you don't see it in dev"
- Body: In dev you have 5 rows and a local database. 6 queries finish in 50ms. In production you have 10,000 rows and a remote DB. Now it's 30 seconds.
- Footer: Mudasir Shah

**Slide 4:**
- Headline: "Fix 1: Eager-load"
- Body: Join the relation in the same query. In Prisma: `include: { author: true }`. In SQLAlchemy: `joinedload()`. One query, not 101.
- Footer: Mudasir Shah

**Slide 5:**
- Headline: "Fix 2: Batch-load"
- Body: Fetch all related rows in one IN-clause query, then map them in memory. Two queries total, no matter how many rows.
- Footer: Mudasir Shah

**Slide 6:**
- Headline: "The lesson"
- Body: The ORM is convenient. It hides the queries. That's the bug and the feature.
- Add query logging in dev so you see the count spike before production does. Index the foreign keys you join on.
- Footer: Mudasir Shah

---

### POST 4 — Rate Limiting (Full-stack/backend)

**LinkedIn caption:**
> One viral tweet and your API is on fire.
> Users see 500s. You see a cloud bill that hurts.
> Rate limiting isn't optional. It's infrastructure ↓

**Carousel slides (7 slides):**

**Slide 1 (Cover):**
- Headline: "One viral post. Your API is down."
- Subtitle: How to survive traffic spikes
- Footer: Mudasir Shah · Full-Stack & AI Engineer

**Slide 2:**
- Headline: "The scenario"
- Body: Your app goes viral. Traffic spikes 50x. Users see 500 errors. Your cloud bill triples. Everyone's unhappy. This is preventable.
- Footer: Mudasir Shah

**Slide 3:**
- Headline: "1. Token bucket"
- Body: Per user/IP at the API gateway. Fast, in-memory. Each user gets N tokens per minute. Simple, effective, no DB calls.
- Footer: Mudasir Shah

**Slide 4:**
- Headline: "2. Redis for scale"
- Body: Distributed counters across multiple instances. Redis keeps everyone on the same page. Atomic increments, no race conditions.
- Footer: Mudasir Shah

**Slide 5:**
- Headline: "3. Be honest with 429"
- Body: Return 429 with a Retry-After header — not 500. Tell the client "slow down" instead of "I'm broken." They can back off gracefully.
- Footer: Mudasir Shah

**Slide 6:**
- Headline: "4. Circuit breaker"
- Body: One slow downstream service shouldn't take down everything. If a dependency fails repeatedly, stop calling it. Fail fast, recover fast.
- Footer: Mudasir Shah

**Slide 7:**
- Headline: "The rule"
- Body: Protect the system before you optimize it. A fast API that dies under load isn't fast.
- Queue + worker for anything that isn't time-sensitive. Keep the hot path lean.
- Footer: Mudasir Shah

---

### POST 5 — Context Switching (Dev productivity)

**LinkedIn caption:**
> You context-switch 12 times a day.
> Each switch costs ~20 min of reloading the problem into your head.
> That's 4 hours gone before you write a line of code ↓

**Carousel slides (6 slides):**

**Slide 1 (Cover):**
- Headline: "The hidden bug in your workday"
- Subtitle: Context switching is stealing 4 hours
- Footer: Mudasir Shah · Full-Stack & AI Engineer

**Slide 2:**
- Headline: "The math"
- Body: 12 task switches per day × ~20 min to reload the problem into your head = 4 hours gone. Before you write a single line of code.
- Footer: Mudasir Shah

**Slide 3:**
- Headline: "1. One dev environment"
- Body: Same Dockerfile, same aliases, same shell config across every project. Zero setup friction. Your muscle memory doesn't reload.
- Footer: Mudasir Shah

**Slide 4:**
- Headline: "2. Batch the shallow work"
- Body: Slack, PR reviews, emails — batch into 2 windows per day. Don't let them interrupt deep work. They're not urgent. They feel urgent.
- Footer: Mudasir Shah

**Slide 5:**
- Headline: "3. The 3-line note"
- Body: Before closing your laptop, write 3 lines: "Where I left off. What's next. What I was stuck on." Your future self skips the 20-min reload.
- Footer: Mudasir Shah

**Slide 6:**
- Headline: "The real fix"
- Body: The bug isn't that you have too much to do. It's that you keep reloading the same problem into your head.
- Time-block 2-hour deep slots. No meetings. No notifications. Protect them like they're meetings with yourself.
- Footer: Mudasir Shah

---

### POST 6 — Reading Code Before Writing It (Career)

**LinkedIn caption:**
> Junior devs open the editor and start typing.
> Senior devs open the editor and read for an hour first.
> Reading is the senior skill. Writing is the junior one ↓

**Carousel slides (6 slides):**

**Slide 1 (Cover):**
- Headline: "The skill that separates juniors from seniors"
- Subtitle: It's not what you think
- Footer: Mudasir Shah · Full-Stack & AI Engineer

**Slide 2:**
- Headline: "The difference"
- Body: Junior devs open the editor and start typing. Senior devs open the editor and read for an hour first. The fastest way to slow down a codebase is to add code you didn't need.
- Footer: Mudasir Shah

**Slide 3:**
- Headline: "1. Search for it"
- Body: Someone may have solved this already. Search the codebase before writing anything. The best code is no code.
- Footer: Mudasir Shah

**Slide 4:**
- Headline: "2. Read the callers"
- Body: What does the calling code actually need? Not what you assume it needs — what it really needs. The tests describe the contract better than the docs.
- Footer: Mudasir Shah

**Slide 5:**
- Headline: "3. Sketch the change"
- Body: If you can't explain the change in 3 sentences, you don't understand it yet. Write it on paper first. Then write the smallest diff that solves the real problem.
- Footer: Mudasir Shah

**Slide 6:**
- Headline: "The lesson"
- Body: Reading is the senior skill. Writing is the junior one.
- Most "hard bugs" are just code someone wrote without reading the code next to it. Read first. Write less. Ship better.
- Footer: Mudasir Shah

---

## 5. How to Build Your First Carousel (step by step)

1. **Open Canva** → search "LinkedIn carousel" → pick a clean minimal template
2. **Set your brand colors:** background (`#0D1117` dark or `#FFFFFF` light), text color, one accent color
3. **Set fonts:** Headlines = Inter Bold or Montserrat Bold. Body = Inter Regular.
4. **Duplicate the slide** for the number of slides in your post (6-7)
5. **Paste text** from the slide breakdowns above into each slide
6. **Add your footer** to every slide: "Mudasir Shah · Full-Stack & AI Engineer"
7. **Export as PDF** (Canva: Share → Download → PDF Standard)
8. **Upload to LinkedIn** → Create post → click the document icon → upload the PDF
9. **Paste the caption** (the short teaser from each post above)
10. **Post**

**Time per carousel:** ~15-20 min once you have a template saved. The first one will take ~45 min.

---

## 6. Quick-Start Order

1. **Post 3 (N+1)** — relatable backend topic, broad audience, easy to engage with
2. **Post 1 (Hallucinations)** — hot AI topic, attracts the right technical peers
3. **Post 6 (Reading code)** — career angle, broad reach, comment-friendly

Then rotate through Post 2, 4, 5.

---

## 7. Reference Files

Saved in `D:\Linkedin-Posts\reference\`:
- `nick_slide_1.jpg` through `nick_slide_12.jpg` — all 12 slides of Nick Saraev's "Guarantees" carousel at 1541×1926 resolution. Open these to study the exact style: clean, text-driven, minimal graphics, consistent footer.
- `musa_p0.jpg`, `musa_p1.jpg`, `musa_p2.jpg` — first 3 cover slides of Muhammad Musa's "5 MVP Mistakes" carousel.

---

*Visual identity: GitHub dark `#0D1117` / Cyan `#22D3EE` / Emerald `#34D399` (dark theme) — OR white `#FFFFFF` / dark text / blue accent (light theme, matches the reference posts). Pick one and stay consistent.*
