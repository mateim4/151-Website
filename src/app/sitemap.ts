import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.SITE_URL ?? "https://151.lu";
const locales = ["en", "fr", "de"] as const;

const pages = [
  { path: "", changeFrequency: "monthly" as const, priority: 1.0 },
  { path: "/scope", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/methodology", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/portfolio", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/diagnostic", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = pages.flatMap(({ path, changeFrequency, priority }) =>
    locales.map((locale) => ({
      url: `${SITE_URL}${locale === "en" ? "" : `/${locale}`}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}${l === "en" ? "" : `/${l}`}${path}`])
        ),
      },
    }))
  );

  const blogPosts = getAllPosts().flatMap((post) =>
    locales.map((locale) => ({
      url: `${SITE_URL}${locale === "en" ? "" : `/${locale}`}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}${l === "en" ? "" : `/${l}`}/blog/${post.slug}`])
        ),
      },
    }))
  );

  return [...staticPages, ...blogPosts];
}
