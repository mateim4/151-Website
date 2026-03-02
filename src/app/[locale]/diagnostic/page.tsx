import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { DoraAssessment } from "@/components/sections/diagnostic/DoraAssessment";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "diagnostic" });
  return buildMetadata({
    title: `${t("title")} | 151`,
    description: t("subtitle"),
    locale,
    path: "/diagnostic",
  });
}

export default function DiagnosticPage() {
  const t = useTranslations("diagnostic");

  return (
    <div className="pt-24">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-bold text-[var(--151-text-primary)] tracking-tight text-center">
              {t("title")}
            </h1>
          </RevealOnScroll>

          <DoraAssessment />
        </div>
      </section>
    </div>
  );
}
