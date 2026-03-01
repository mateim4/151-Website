import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/metadata";
import { HeroSection } from "@/components/sections/home/HeroSection";
import { ValueProp } from "@/components/sections/home/ValueProp";
import { CompetencyGrid } from "@/components/sections/home/CompetencyGrid";
import { CTASection } from "@/components/sections/home/CTASection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildMetadata({ title: t("title"), description: t("description"), locale });
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ValueProp />
      <CompetencyGrid />
      <CTASection />
    </>
  );
}
