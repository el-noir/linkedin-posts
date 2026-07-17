// One slide as a @react-pdf/renderer <Page>.
// Direct port of the v6 mockup design. @react-pdf/renderer handles text
// wrapping natively, so the overflow bug from PIL can't happen here.

import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PALETTE, FONTS, LAYOUT, FOOTER, sectionColor } from "./theme";
import type { Slide } from "@/lib/types";

const TOTAL_FALLBACK = 6;

interface SlideProps {
  slide: Slide;
  idx: number; // 1-based
  total: number;
  isCover?: boolean;
  isClosing?: boolean;
}

export function SlidePage({ slide, idx, total, isCover, isClosing }: SlideProps) {
  const accent = sectionColor(idx - 1);
  const styles = makeStyles(accent);

  const headlineLines = slide.headline.split("\n");
  const bodyLines = slide.body ? slide.body.split("\n") : [];
  const label = isCover ? "Engineering" : isClosing ? "The lesson" : "Section";

  return (
    <Page size={[LAYOUT.width, LAYOUT.height]} style={styles.page}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(idx / total) * 100}%` }]} />
      </View>

      {/* Header: color block + label + slide number */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.colorBlock} />
          <Text style={styles.label}>{label.toUpperCase()}</Text>
        </View>
        <Text style={styles.slideNum}>
          {String(idx).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </Text>
      </View>

      {isCover ? (
        // Cover: headline is the sole hero
        <View style={styles.coverBody}>
          <View>
            {headlineLines.map((line, i) => (
              <Text key={i} style={styles.coverHeadline}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.accentRule} />
        </View>
      ) : isClosing ? (
        // Closing: headline + body + save prompt (inline, flows after body — never overlaps)
        <View style={styles.closingBody}>
          <View>
            {headlineLines.map((line, i) => (
              <Text key={i} style={styles.headline}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.accentRule} />
          <View style={styles.bodyBlock}>
            {bodyLines.map((line, i) =>
              line.trim() === "" ? (
                <Text key={i} style={styles.bodyGap} />
              ) : (
                <Text key={i} style={styles.bodyText}>
                  {line}
                </Text>
              ),
            )}
          </View>
          <Text style={styles.ctaSave}>Save this for next time ↓</Text>
        </View>
      ) : (
        // Body slide: headline + accent rule + body
        <View style={styles.bodySection}>
          <View>
            {headlineLines.map((line, i) => (
              <Text key={i} style={styles.headline}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.accentRule} />
          <View style={styles.bodyBlock}>
            {bodyLines.map((line, i) =>
              line.trim() === "" ? (
                <Text key={i} style={styles.bodyGap} />
              ) : (
                <Text key={i} style={styles.bodyText}>
                  {line}
                </Text>
              ),
            )}
          </View>
        </View>
      )}

      {/* Footer — locked identical on every slide */}
      <View style={styles.footerDivider} />
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerName}>{FOOTER.name}</Text>
          <Text style={styles.footerDot}>·</Text>
        </View>
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
      paddingHorizontal: LAYOUT.margin,
      paddingVertical: 0,
      fontFamily: FONTS.body,
      color: PALETTE.text,
      position: "relative",
    },
    progressTrack: {
      position: "absolute",
      top: LAYOUT.progressBarY,
      left: LAYOUT.margin,
      width: LAYOUT.contentW,
      height: LAYOUT.progressBarH,
      backgroundColor: PALETTE.divider,
    },
    progressFill: {
      height: LAYOUT.progressBarH,
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
    colorBlock: {
      width: 10,
      height: 10,
      backgroundColor: accent,
      marginRight: 12,
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
      top: 460,
      left: LAYOUT.margin,
      right: LAYOUT.margin,
    },
    coverHeadline: {
      fontFamily: FONTS.headline,
      fontWeight: "bold",
      fontSize: 112,
      lineHeight: 1.1,
      color: PALETTE.text,
      marginBottom: 4,
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
      fontSize: 82,
      lineHeight: 1.15,
      color: PALETTE.text,
      marginBottom: 4,
    },
    accentRule: {
      width: 56,
      height: 3,
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
      marginBottom: 0,
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
    footerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    footerName: {
      fontFamily: FONTS.body,
      fontWeight: "semibold",
      fontSize: 22,
      color: PALETTE.text,
    },
    footerDot: {
      fontFamily: FONTS.body,
      fontSize: 22,
      color: PALETTE.muted,
      marginLeft: 18,
    },
    footerTitle: {
      fontFamily: FONTS.body,
      fontWeight: "semibold",
      fontSize: 22,
      color: PALETTE.muted,
    },
  });
}
