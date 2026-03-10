import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <>
      <PageHeader
        title={t("title")}
        align="center"
        decoration="gradient-line"
      />
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <DoraAssessment />
        </div>
      </section>
    </>
  );
}
