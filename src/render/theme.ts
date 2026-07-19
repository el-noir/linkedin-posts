// The W4 brand identity — cream + teal, baked into the renderer.
// Signature: teal sidebar on left edge + teal "M" monogram top-right.
// This is the source of truth for the design.

import { Font } from "@react-pdf/renderer";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

const FONTS_DIR = [
  path.join(HERE, "fonts"),
  path.join(process.cwd(), "src", "render", "fonts"),
].find((p) => existsSync(p)) ?? path.join(HERE, "fonts");

// Space Grotesk (headlines) + Inter (body/labels) — clean, modern, distinctive
Font.register({
  family: "SpaceGrotesk",
  fonts: [{ src: path.join(FONTS_DIR, "SpaceGrotesk-Bold.ttf"), fontWeight: "bold" }],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(FONTS_DIR, "Inter-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(FONTS_DIR, "Inter-SemiBold.ttf"), fontWeight: "semibold" },
  ],
});

// Disable hyphenation — @react-pdf/renderer auto-hyphenates words that don't fit
// a line, which breaks words like "production" into "pro-duction". We want words
// to wrap whole, never split with hyphens.
Font.registerHyphenationCallback((word) => [word]);

// W4 palette — warm cream + deep teal (from v6_slide_5 analysis)
export const PALETTE = {
  bg: "#F9F7F2",       // warm cream
  text: "#1D1A15",     // warm near-black
  muted: "#67625B",     // warm gray
  divider: "#E1DED7",  // warm hairline
  accent: "#166B6B",   // deep teal (the brand color)
} as const;

export const FONTS = {
  headline: "SpaceGrotesk",
  body: "Inter",
} as const;

export const LAYOUT = {
  width: 1080,
  height: 1350,
  margin: 72,
  contentW: 936,
  sidebarW: 8,          // teal sidebar width (the signature)
  headerY: 130,
  headlineY: 320,
  gapHeadRule: 40,
  gapRuleBody: 60,
  bodyLineH: 56,
  bodyGap: 24,
  footerDividerY: 1220,
  footerTextY: 1255,
} as const;

export const FOOTER = {
  name: "Mudasir Shah",
  title: "Full-Stack & AI Engineer",
} as const;

// W4 uses a single accent color (teal) — no per-slide color coding.
// Keeping this function for compatibility but it always returns teal.
export function sectionColor(_idx: number): string {
  return PALETTE.accent;
}
