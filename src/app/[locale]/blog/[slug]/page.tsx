import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";
import {
  getAllPosts,
  getPostBySlug,
  getLocalizedTitle,
  getLocalizedExcerpt,
} from "@/lib/blog";
import { Link } from "@/i18n/navigation";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { MDXContent } from "@/components/sections/blog/MDXContent";
import { Tag } from "@/components/ui/Tag";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const t = await getTranslations({ locale, namespace: "blog" });
  return buildMetadata({
    title: `${getLocalizedTitle(post, locale)} | 151 ${t("title")}`,
    description: getLocalizedExcerpt(post, locale),
    locale,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="pt-24">
      <article className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <RevealOnScroll>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm text-[var(--151-text-muted)] hover:text-[var(--151-magenta-500)] transition-colors mb-8"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {t("backToList")}
            </Link>
          </RevealOnScroll>

          {/* Header */}
          <RevealOnScroll>
            <header className="mb-12">
              <div className="flex items-center gap-3 text-sm text-[var(--151-text-muted)] mb-4">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span>&middot;</span>
                <span>{t("minRead", { minutes: post.readingTime })}</span>
              </div>

              <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--151-text-primary)] tracking-tight leading-tight">
                {getLocalizedTitle(post, locale)}
              </h1>

              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </header>
          </RevealOnScroll>

          {/* Content */}
          <RevealOnScroll delay={0.1}>
            <div className="prose-151">
              <MDXContent source={post.content} />
            </div>
          </RevealOnScroll>
        </div>
      </article>
    </div>
  );
}
