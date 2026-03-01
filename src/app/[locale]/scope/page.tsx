import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { DomainGrid } from "@/components/sections/scope/DomainGrid";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "scope" });
  return buildMetadata({
    title: `${t("title")} | 151`,
    description: t("subtitle"),
    locale,
    path: "/scope",
  });
}

export default function ScopePage() {
  const t = useTranslations("scope");

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
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--151-text-secondary)]">
              {t("subtitle")}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <DomainGrid />
    </div>
  );
}
