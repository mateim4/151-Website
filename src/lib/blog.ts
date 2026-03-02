import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  titleFr?: string;
  titleDe?: string;
  date: string;
  author: string;
  tags: string[];
  readingTime: number;
  excerpt: string;
  excerptFr?: string;
  excerptDe?: string;
  content: string;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug: data.slug ?? file.replace(/\.mdx$/, ""),
        title: data.title ?? "",
        titleFr: data.titleFr,
        titleDe: data.titleDe,
        date: data.date ?? "",
        author: data.author ?? "151",
        tags: data.tags ?? [],
        readingTime: data.readingTime ?? 5,
        excerpt: data.excerpt ?? "",
        excerptFr: data.excerptFr,
        excerptDe: data.excerptDe,
        content,
      } satisfies BlogPost;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getLocalizedTitle(post: BlogPost, locale: string): string {
  if (locale === "fr" && post.titleFr) return post.titleFr;
  if (locale === "de" && post.titleDe) return post.titleDe;
  return post.title;
}

export function getLocalizedExcerpt(post: BlogPost, locale: string): string {
  if (locale === "fr" && post.excerptFr) return post.excerptFr;
  if (locale === "de" && post.excerptDe) return post.excerptDe;
  return post.excerpt;
}
