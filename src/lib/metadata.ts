import type { Metadata } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://151.lu";

const localeMap: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  de: "de_DE",
};

interface PageMeta {
  title: string;
  description: string;
  locale: string;
  path?: string;
}

export function buildMetadata({ title, description, locale, path = "" }: PageMeta): Metadata {
  const url = `${SITE_URL}${locale === "en" ? "" : `/${locale}`}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}${path}`,
        fr: `${SITE_URL}/fr${path}`,
        de: `${SITE_URL}/de${path}`,
        "x-default": `${SITE_URL}${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "151",
      locale: localeMap[locale] ?? "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
