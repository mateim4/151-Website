import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/ui/PageHeader";
import { CaseStudyCards } from "@/components/sections/portfolio/CaseStudyCard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  return buildMetadata({
    title: `${t("title")} | 151`,
    description: t("subtitle"),
    locale,
    path: "/portfolio",
  });
}

export default function PortfolioPage() {
  const t = useTranslations("portfolio");

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        decoration="orb"
      />
      <CaseStudyCards />
    </>
  );
}
