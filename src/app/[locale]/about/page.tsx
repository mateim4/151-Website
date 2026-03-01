import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ContactForm } from "@/components/sections/about/ContactForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildMetadata({
    title: `${t("title")} | 151`,
    description: t("subtitle"),
    locale,
    path: "/about",
  });
}

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="pt-24">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-bold text-[var(--151-text-primary)] tracking-tight">
              {t("title")}
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <p className="mt-4 text-lg text-[var(--151-text-secondary)]">
              {t("subtitle")}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-[var(--151-bg-section-alt)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <p className="text-lg leading-relaxed text-[var(--151-text-secondary)]">
              {t("bio")}
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <blockquote className="mt-8 pl-6 border-l-2 border-[var(--151-magenta-500)] italic text-lg text-[var(--151-text-primary)]">
              &ldquo;{t("quote")}&rdquo;
            </blockquote>
          </RevealOnScroll>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <h2 className="font-[var(--font-display)] text-3xl font-bold text-[var(--151-text-primary)] tracking-tight">
              {t("contact.title")}
            </h2>
            <p className="mt-2 text-[var(--151-text-secondary)]">
              {t("contact.subtitle")}
            </p>
          </RevealOnScroll>

          <div className="mt-10">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
