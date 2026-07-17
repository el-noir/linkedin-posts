// CarouselPdf — builds the full PDF document from a Post.
// One <Page> per slide. Closing slide gets a fixed "Save this ↓" prompt
// anchored to the bottom; GLM's body text (including the question) renders above.

import { Document } from "@react-pdf/renderer";
import { SlidePage } from "./Slide";
import type { Post } from "@/lib/types";

export function CarouselPdf({ post }: { post: Post }) {
  const total = post.slides.length;
  return (
    <Document>
      {post.slides.map((slide, i) => {
        const idx = i + 1;
        const isCover = i === 0;
        const isClosing = i === total - 1;
        return (
          <SlidePage
            key={i}
            slide={slide}
            idx={idx}
            total={total}
            isCover={isCover}
            isClosing={isClosing}
          />
        );
      })}
    </Document>
  );
}
