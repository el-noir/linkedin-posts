// One slide as a @react-pdf/renderer <Page>.
// W4 brand identity: cream bg, teal sidebar, teal "M" monogram, Space Grotesk headlines.

import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PALETTE, FONTS, LAYOUT, FOOTER } from "./theme";
import type { Slide } from "@/lib/types";

// Sanitize text: convert hyphens to em-dashes, straight quotes to smart quotes.
// GLM sometimes returns hyphens-as-dashes and straight quotes despite instructions.
function sanitize(text: string): string {
  return text
    .replace(/ - /g, " — ")        // spaced hyphen → em-dash
    .replace(/"([^"]+)"/g, "\u201C$1\u201D")  // straight double quotes → curly
    .replace(/'([^']+)'/g, "\u2018$1\u2019")  // straight single quotes → curly
    .replace(/'/g, "\u2019")       // apostrophes
    .replace(/\.\.\./g, "…");      // three dots → ellipsis
}

interface SlideProps {
  slide: Slide;
  idx: number;
  total: number;
  isCover?: boolean;
  isClosing?: boolean;
}

export function SlidePage({ slide, idx, total, isCover, isClosing }: SlideProps) {
  const accent = PALETTE.accent;
  const styles = makeStyles(accent);

  const headlineLines = slide.headline.split("\n").map(sanitize);
  const bodyLines = slide.body ? slide.body.split("\n").map(sanitize) : [];

  return (
    <Page size={[LAYOUT.width, LAYOUT.height]} style={styles.page}>
      {/* Teal sidebar on left edge (the signature) */}
      <View style={styles.sidebar} />

      {/* Header: label + slide number */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.label}>{isCover ? "ENGINEERING" : isClosing ? "THE LESSON" : "SECTION"}</Text>
        </View>
        <Text style={styles.slideNum}>
          {String(idx).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </Text>
      </View>

      {isCover ? (
        <View style={styles.coverBody}>
          <View>
            {headlineLines.map((line, i) => (
              <Text key={i} style={styles.coverHeadline}>{line}</Text>
            ))}
          </View>
          <View style={styles.accentDot} />
        </View>
      ) : isClosing ? (
        <View style={styles.closingBody}>
          <View>
            {headlineLines.map((line, i) => (
              <Text key={i} style={styles.headline}>{line}</Text>
            ))}
          </View>
          <View style={styles.accentLineVertical} />
          <View style={styles.bodyBlock}>
            {bodyLines.map((line, i) =>
              line.trim() === "" ? (
                <Text key={i} style={styles.bodyGap} />
              ) : (
                <Text key={i} style={styles.bodyText}>{line}</Text>
              ),
            )}
          </View>
          <Text style={styles.ctaSave}>Save this for next time ↓</Text>
        </View>
      ) : (
        <View style={styles.bodySection}>
          <View>
            {headlineLines.map((line, i) => (
              <Text key={i} style={styles.headline}>{line}</Text>
            ))}
          </View>
          <View style={styles.accentLineVertical} />
          <View style={styles.bodyBlock}>
            {bodyLines.map((line, i) =>
              line.trim() === "" ? (
                <Text key={i} style={styles.bodyGap} />
              ) : (
                <Text key={i} style={styles.bodyText}>{line}</Text>
              ),
            )}
          </View>
        </View>
      )}

      {/* Footer — name + title (monogram is the sidebar, not repeated here) */}
      <View style={styles.footerDivider} />
      <View style={styles.footer}>
        <Text style={styles.footerName}>{FOOTER.name}</Text>
        <Text style={styles.footerTitle}>{FOOTER.title}</Text>
      </View>
    </Page>
  );
}

function makeStyles(accent: string) {
  return StyleSheet.create({
    page: {
      width: LAYOUT.width,
      height: LAYOUT.height,
      backgroundColor: PALETTE.bg,
      fontFamily: FONTS.body,
      color: PALETTE.text,
      position: "relative",
    },
    // Teal sidebar — the signature element
    sidebar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: LAYOUT.sidebarW,
      backgroundColor: accent,
    },
    header: {
      position: "absolute",
      top: LAYOUT.headerY,
      left: LAYOUT.margin,
      right: LAYOUT.margin,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    label: {
      fontFamily: FONTS.body,
      fontWeight: "semibold",
      fontSize: 22,
      color: PALETTE.muted,
      letterSpacing: 3,
    },
    slideNum: {
      fontFamily: FONTS.body,
      fontWeight: "semibold",
      fontSize: 22,
      color: PALETTE.muted,
    },
    coverBody: {
      position: "absolute",
      top: 480,
      left: LAYOUT.margin,
      right: LAYOUT.margin,
    },
    coverHeadline: {
      fontFamily: FONTS.headline,
      fontWeight: "bold",
      fontSize: 108,
      lineHeight: 1.1,
      color: PALETTE.text,
      marginBottom: 4,
    },
    accentDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: accent,
      marginTop: 40,
    },
    bodySection: {
      position: "absolute",
      top: LAYOUT.headlineY,
      left: LAYOUT.margin,
      right: LAYOUT.margin,
    },
    closingBody: {
      position: "absolute",
      top: LAYOUT.headlineY,
      left: LAYOUT.margin,
      right: LAYOUT.margin,
      bottom: 200,
    },
    headline: {
      fontFamily: FONTS.headline,
      fontWeight: "bold",
      fontSize: 78,
      lineHeight: 1.15,
      color: PALETTE.text,
      marginBottom: 4,
    },
    // Vertical accent line (W4 signature — replaces horizontal rule)
    accentLineVertical: {
      width: 4,
      height: 80,
      backgroundColor: accent,
      marginTop: 40,
      marginBottom: 60,
    },
    bodyBlock: {
      flexDirection: "column",
    },
    bodyText: {
      fontFamily: FONTS.body,
      fontWeight: "normal",
      fontSize: 38,
      lineHeight: 1.5,
      color: PALETTE.text,
    },
    bodyGap: {
      height: 24,
    },
    ctaSave: {
      fontFamily: FONTS.body,
      fontWeight: "normal",
      fontSize: 38,
      color: PALETTE.muted,
      marginTop: 60,
    },
    footerDivider: {
      position: "absolute",
      bottom: 130,
      left: LAYOUT.margin,
      right: LAYOUT.margin,
      height: 1,
      backgroundColor: PALETTE.divider,
    },
    footer: {
      position: "absolute",
      bottom: 95,
      left: LAYOUT.margin,
      right: LAYOUT.margin,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerName: {
      fontFamily: FONTS.body,
      fontWeight: "semibold",
      fontSize: 22,
      color: PALETTE.text,
    },
    footerTitle: {
      fontFamily: FONTS.body,
      fontWeight: "semibold",
      fontSize: 22,
      color: PALETTE.muted,
    },
  });
}
