"use client";

import { useEffect, useState, useCallback } from "react";
import type { Post, Slide, GenerateInput } from "@/lib/types";

type Field = GenerateInput["field"];

const FIELDS: { value: Field; label: string }[] = [
  { value: "auto", label: "Auto-rotate" },
  { value: "AI / LLM engineering", label: "AI / LLM engineering" },
  { value: "Full-stack / backend", label: "Full-stack / backend" },
  { value: "Dev productivity / tooling", label: "Dev productivity / tooling" },
  { value: "Career / SWE lessons", label: "Career / SWE lessons" },
];

const SLIDE_COUNTS = [5, 6, 7, 8];

const SECTION_COLORS = [
  "#A0502E", "#B8860B", "#6B3D8B", "#1E6343", "#166B6B", "#8B2C38",
];

export default function HomePage() {
  const [field, setField] = useState<Field>("auto");
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(6);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [history, setHistory] = useState<{ id: string; post: Post }[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.ok) setHistory(data.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, topic: topic || undefined, slideCount }),
      });
      const data = await res.json();
      if (data.ok) {
        setPost(data.data);
        loadHistory();
      } else {
        setError(data.error || "Generation failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!post) return;
    setPdfLoading(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "PDF render failed" }));
        setError(data.error || "PDF render failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linkedin-carousel-${post.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setPdfLoading(false);
    }
  };

  const updateSlide = (idx: number, patch: Partial<Slide>) => {
    if (!post) return;
    setPost({
      ...post,
      slides: post.slides.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    });
  };

  const updateCaption = (caption: string) => {
    if (!post) return;
    setPost({ ...post, caption });
  };

  const loadPost = (p: Post) => {
    setPost(p);
    setField(p.field as Field);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar: form + history */}
      <aside className="w-80 border-r border-[var(--divider)] p-6 flex flex-col gap-6 overflow-y-auto h-screen sticky top-0">
        <div>
          <h1 className="text-xl font-bold mb-1">LinkedIn Post Agent</h1>
          <p className="text-sm text-[var(--muted)]">Generate carousels in your style.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Field
            </label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value as Field)}
              className="w-full border border-[var(--divider)] rounded-md px-3 py-2 text-sm bg-white"
            >
              {FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Topic (optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. prompt injection"
              className="w-full border border-[var(--divider)] rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Slides
            </label>
            <div className="flex gap-2">
              {SLIDE_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSlideCount(n)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition ${
                    slideCount === n
                      ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)]"
                      : "bg-white border-[var(--divider)] hover:border-[var(--muted)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-md font-semibold text-sm bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Generating…" : "Generate post"}
          </button>

          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>

        <div className="border-t border-[var(--divider)] pt-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
            History
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No posts yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map(({ id, post: p }) => (
                <li key={id}>
                  <button
                    onClick={() => loadPost(p)}
                    className="w-full text-left p-2 rounded-md hover:bg-white border border-transparent hover:border-[var(--divider)] transition"
                  >
                    <p className="text-sm font-medium truncate">{p.topic}</p>
                    <p className="text-xs text-[var(--muted)]">{p.field}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main: editor + preview */}
      <main className="flex-1 p-6 overflow-y-auto">
        {!post ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold mb-2">No post yet</h2>
            <p className="text-[var(--muted)]">
              Pick a field, optionally add a topic, and click Generate.
            </p>
          </div>
        ) : (
          <div className="flex gap-8 max-w-6xl">
            {/* Editor */}
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Caption
                </label>
                <textarea
                  value={post.caption}
                  onChange={(e) => updateCaption(e.target.value)}
                  rows={4}
                  className="w-full border border-[var(--divider)] rounded-md px-3 py-2 text-sm bg-white font-mono"
                />
              </div>

              {post.slides.map((slide, idx) => {
                const color = SECTION_COLORS[idx % SECTION_COLORS.length];
                const isCover = idx === 0;
                const isClosing = idx === post.slides.length - 1;
                return (
                  <div
                    key={idx}
                    className="border border-[var(--divider)] rounded-lg p-4"
                    style={{ borderLeft: `4px solid ${color}` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        {isCover ? "Cover" : isClosing ? "Closing" : `Slide ${idx + 1}`}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {String(idx + 1).padStart(2, "0")} / {String(post.slides.length).padStart(2, "0")}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={slide.headline}
                      onChange={(e) => updateSlide(idx, { headline: e.target.value })}
                      placeholder="Headline"
                      className="w-full border border-[var(--divider)] rounded-md px-3 py-2 text-base font-bold mb-3 bg-white"
                    />
                    <textarea
                      value={slide.body ?? ""}
                      onChange={(e) => updateSlide(idx, { body: e.target.value })}
                      rows={4}
                      placeholder="Body (omit on cover)"
                      className="w-full border border-[var(--divider)] rounded-md px-3 py-2 text-sm bg-white"
                    />
                  </div>
                );
              })}

              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="w-full py-3 rounded-md font-semibold text-sm bg-[var(--text)] text-[var(--bg)] hover:opacity-90 disabled:opacity-50 transition"
              >
                {pdfLoading ? "Building PDF…" : "Build & download PDF"}
              </button>
            </div>

            {/* Preview — first slide */}
            <div className="w-[432px] flex-shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                Preview (cover)
              </p>
              <SlidePreview slide={post.slides[0]} idx={1} total={post.slides.length} isCover />
              <div className="mt-4 flex gap-2 flex-wrap">
                {post.slides.slice(1).map((s, i) => (
                  <button
                    key={i}
                    className="w-10 h-12 rounded border border-[var(--divider)] text-xs text-[var(--muted)] hover:border-[var(--muted)] transition"
                    title={s.headline}
                  >
                    {i + 2}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--muted)] mt-2">
                Full preview coming — the PDF is the source of truth.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Live HTML preview of a single slide — mimics the PDF layout.
function SlidePreview({
  slide,
  idx,
  total,
  isCover,
}: {
  slide: Slide;
  idx: number;
  total: number;
  isCover?: boolean;
}) {
  const accent = SECTION_COLORS[(idx - 1) % SECTION_COLORS.length];
  const scale = 0.4; // 1080 -> 432px
  return (
    <div
      style={{
        width: 1080 * scale,
        height: 1350 * scale,
        backgroundColor: "#FAF8F3",
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          top: 50 * scale,
          left: 72 * scale,
          width: 936 * scale,
          height: 3 * scale,
          backgroundColor: "#E8E1D4",
        }}
      >
        <div
          style={{
            width: `${(idx / total) * 100}%`,
            height: "100%",
            backgroundColor: accent,
          }}
        />
      </div>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 130 * scale,
          left: 72 * scale,
          right: 72 * scale,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22 * scale,
          color: "#6E665B",
          fontWeight: 600,
          letterSpacing: 2,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 * scale }}>
          <span style={{ width: 10 * scale, height: 10 * scale, backgroundColor: accent }} />
          {(isCover ? "ENGINEERING" : "SECTION").toUpperCase()}
        </span>
        <span>
          {String(idx).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      {/* Headline */}
      <div
        style={{
          position: "absolute",
          top: (isCover ? 460 : 320) * scale,
          left: 72 * scale,
          right: 72 * scale,
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          fontSize: (isCover ? 112 : 82) * scale,
          lineHeight: 1.1,
          color: "#1F1B16",
        }}
      >
        {slide.headline.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      {/* Accent rule */}
      <div
        style={{
          position: "absolute",
          top: (isCover ? 460 + 112 * slide.headline.split("\n").length + 40 : 320 + 82 + 40) * scale,
          left: 72 * scale,
          width: 56 * scale,
          height: 3 * scale,
          backgroundColor: accent,
        }}
      />
      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 130 * scale,
          left: 72 * scale,
          right: 72 * scale,
          height: 1 * scale,
          backgroundColor: "#E8E1D4",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 95 * scale,
          left: 72 * scale,
          right: 72 * scale,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22 * scale,
          fontWeight: 600,
        }}
      >
        <span style={{ color: "#1F1B16" }}>Mudasir Shah</span>
        <span style={{ color: "#6E665B" }}>Full-Stack & AI Engineer</span>
      </div>
    </div>
  );
}
