import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";
import { getAllPosts, getLocalizedTitle, getLocalizedExcerpt } from "@/lib/blog";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { Tag } from "@/components/ui/Tag";
import { PageHeader } from "@/components/ui/PageHeader";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return buildMetadata({
    title: `${t("title")} | 151`,
    description: t("subtitle"),
    locale,
    path: "/blog",
  });
}

export default function BlogPage() {
  const t = useTranslations("blog");
  const locale = useLocale();
  const posts = getAllPosts();

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {posts.map((post, i) => (
              <RevealOnScroll key={post.slug} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
                <article
                  className={cn(
                    "group rounded-2xl border border-[var(--151-border-subtle)] p-6 sm:p-8",
                    "bg-[var(--151-bg-elevated)] transition-[border-color,box-shadow,transform] duration-300",
                    "hover:border-[var(--151-border-medium)]"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 text-xs text-[var(--151-text-muted)] mb-3">
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

                      <h2 className="text-xl sm:text-2xl font-bold text-[var(--151-text-primary)] font-[var(--font-display)] group-hover:text-[var(--151-magenta-500)] transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {getLocalizedTitle(post, locale)}
                        </Link>
                      </h2>

                      <p className="mt-3 text-sm leading-relaxed text-[var(--151-text-secondary)]">
                        {getLocalizedExcerpt(post, locale)}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-[var(--151-magenta-500)] hover:text-[var(--151-magenta-400)] transition-colors"
                    >
                      {t("readMore")}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
