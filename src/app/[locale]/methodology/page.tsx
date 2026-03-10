import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/ui/PageHeader";
import { TDATimeline } from "@/components/sections/methodology/TDATimeline";
import { FrameworksSection } from "@/components/sections/methodology/FrameworksSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "methodology" });
  return buildMetadata({
    title: `${t("title")} | 151`,
    description: t("subtitle"),
    locale,
    path: "/methodology",
  });
}

export default function MethodologyPage() {
  const t = useTranslations("methodology");

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        decoration="grid-dots"
      />
      <TDATimeline />
      <FrameworksSection />
    </>
  );
}
