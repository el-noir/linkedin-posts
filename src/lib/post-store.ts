// Post store — read/write posts as JSON files in posts/.
// Each post is one file: <date>-<slug>.json. Keeps history simple, no DB.
// The agent reads recent topics from here to avoid repeats.

import { promises as fs } from "node:fs";
import path from "node:path";
import type { Post } from "./types";

const POSTS_DIR = path.join(process.cwd(), "posts");

async function ensureDir(): Promise<void> {
  await fs.mkdir(POSTS_DIR, { recursive: true });
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

// Returns the list of saved posts, newest first.
export async function listPosts(): Promise<{ id: string; post: Post }[]> {
  await ensureDir();
  const files = await fs.readdir(POSTS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const out: { id: string; post: Post }[] = [];
  for (const f of jsonFiles) {
    try {
      const raw = await fs.readFile(path.join(POSTS_DIR, f), "utf8");
      const post = JSON.parse(raw) as Post;
      out.push({ id: f.replace(/\.json$/, ""), post });
    } catch {
      // skip corrupt files
    }
  }
  out.sort((a, b) => b.id.localeCompare(a.id));
  return out;
}

// Returns the N most recent post topics — used to avoid repeats.
export async function recentTopics(limit = 5): Promise<string[]> {
  const posts = await listPosts();
  return posts.slice(0, limit).map((p) => p.post.topic);
}

export async function savePost(post: Post): Promise<string> {
  await ensureDir();
  const id = `${dateStamp()}-${slugify(post.topic)}`;
  const filePath = path.join(POSTS_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(post, null, 2), "utf8");
  return id;
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const raw = await fs.readFile(path.join(POSTS_DIR, `${id}.json`), "utf8");
    return JSON.parse(raw) as Post;
  } catch {
    return null;
  }
}
