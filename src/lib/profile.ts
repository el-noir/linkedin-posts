// Your profile — baked into the system prompt on every LLM call.
// The agent uses this to write in your voice, in your fields, never inventing
// experience. Edit this file to change what the agent knows about you.

export const PROFILE = {
  name: "Mudasir Shah",
  title: "Full-Stack Developer & AI Integration Engineer",
  location: "Islamabad, Pakistan",
  handle: "mudasir-shah43",

  fields: [
    "AI / LLM engineering",
    "Full-stack / backend",
    "Dev productivity / tooling",
    "Career / SWE lessons",
  ] as const,

  skills: {
    languages: ["Python", "JavaScript (ES6+)", "TypeScript", "Bash"],
    backend: ["FastAPI", "Node.js", "NestJS", "RESTful APIs", "Redis caching", "WebSockets", "Authentication"],
    databases: ["PostgreSQL", "MongoDB", "Prisma ORM", "Qdrant", "Firebase", "SQL Server"],
    ai: ["OpenAI", "Claude", "Claude Agent SDK", "LangChain", "LangGraph", "RAG", "Groq"],
    frontend: ["React.js", "Next.js", "Tailwind CSS", "ShadCN UI", "Vite"],
    tools: ["Git", "Docker", "CI/CD", "Linux", "AWS", "Postman", "Jest", "Mocha"],
  },

  achievements: [
    "CTF Finalist — Black Hat MEA 2025 (Riyadh)",
    "5th of 600+ — Vyrothon 2026 AI Hackathon",
  ],

  // Archetype-aware styles — the agent adapts based on which archetype fits the scenario.
  archetypeStyles: {
    "problem-solution": "Open with a real, painful problem. Walk through the fix step by step. End with the takeaway.",
    "story-lesson": "Personal, specific, reflective. Tell what happened, what you learned. No moralizing.",
    "contrarian": "Sharp, opinionated, slightly uncomfortable. Lead with the claim. Defend it. Acknowledge the strongest counter.",
    "listicle": "Punchy, scannable, one idea per slide. Each item earns its slot — no filler.",
    "myth-busting": "Name the myth. Show why it's wrong with evidence. Give the corrected mental model.",
    "behind-the-scenes": "How I built it. The real process — decisions, dead ends, what I'd do differently. No victory lap.",
  } as const,

  tone: "Direct, technical, no hype. Like a senior engineer explaining to a peer.",

  rules: [
    "Never invent personal experience. If the scenario asks for personal, write it as 'I' but keep it generic enough that it could plausibly be the author — don't fabricate named projects, employers, or specific numbers.",
    "Each slide has ONE idea. Body text is at most 4 lines.",
    "Cover slide = a provocative hook headline, at most 8 words. No subtitle, no label clutter.",
    "Closing slide = a takeaway + a specific question that drives comments. End with a 'save this' prompt.",
    "Use smart quotes (curly), em-dashes (—), ellipsis (…). Never straight quotes, never hyphens-as-dashes.",
    "End every post with a specific question that someone would actually want to answer in a comment.",
    "Don't use hashtags in the slide text — only in the caption.",
    "Don't address the reader as 'you guys' or 'folks'. Address them as 'you'.",
    "Pick the archetype that best fits the scenario. Don't force a listicle if the scenario wants a story.",
  ],
} as const;

export type Field = (typeof PROFILE.fields)[number];
