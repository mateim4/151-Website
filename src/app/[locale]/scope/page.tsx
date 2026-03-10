import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        decoration="orb"
      />
      <DomainGrid />
    </>
  );
}
