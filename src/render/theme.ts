// The v6 design — palette, fonts, layout. Baked into the renderer.
// This is the source of truth: the PIL mockup and the @react-pdf renderer
// both read from these constants. Edit here to change the design.

import { Font } from "@react-pdf/renderer";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve fonts dir relative to THIS file at runtime.
// __dirname doesn't exist in ESM; derive it from import.meta.url.
// This is the only reliable way to find bundled assets in Next.js.
const HERE = path.dirname(fileURLToPath(import.meta.url));

const FONTS_DIR = [
  path.join(HERE, "fonts"),                           // src/render/fonts (same dir as theme.ts)
  path.join(process.cwd(), "src", "render", "fonts"), // fallback: CWD
].find((p) => existsSync(p)) ?? path.join(HERE, "fonts");

// Register fonts once. Fraunces (serif) for headlines, Inter (sans) for body/labels.
Font.register({
  family: "Fraunces",
  fonts: [{ src: path.join(FONTS_DIR, "Fraunces-Bold.ttf"), fontWeight: "bold" }],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(FONTS_DIR, "Inter-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(FONTS_DIR, "Inter-SemiBold.ttf"), fontWeight: "semibold" },
  ],
});

export const PALETTE = {
  bg: "#FAF8F3", // warm cream
  text: "#1F1B16", // warm near-black
  muted: "#6E665B", // warm gray
  divider: "#E8E1D4", // warm hairline
} as const;

// Color-coded section accents — one per slide. Color = navigation.
export const SECTION_COLORS = [
  "#A0502E", // burnt sienna (cover)
  "#B8860B", // deep gold (problem)
  "#6B3D8B", // plum (context)
  "#1E6343", // forest green (fix 1)
  "#166B6B", // deep teal (fix 2)
  "#8B2C38", // oxblood (lesson)
] as const;

export const FONTS = {
  headline: "Fraunces",
  body: "Inter",
} as const;

export const LAYOUT = {
  width: 1080,
  height: 1350,
  margin: 72,
  contentW: 936, // 1080 - 2*72
  progressBarY: 50,
  progressBarH: 3,
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

// Pick a section color by slide index (cycles if more slides than colors).
export function sectionColor(idx: number): string {
  return SECTION_COLORS[idx % SECTION_COLORS.length];
}
