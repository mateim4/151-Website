const SITE_URL = process.env.SITE_URL ?? "https://151.lu";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "151",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "Senior infrastructure architecture consultancy specializing in enterprise-grade infrastructure design, automation, and Technical Design Authority governance.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Steinsel",
    addressCountry: "LU",
  },
  areaServed: ["LU", "DE", "FR", "BE"],
  knowsAbout: [
    "Infrastructure Architecture",
    "Cloud Computing",
    "Network Architecture",
    "DevOps",
    "Infrastructure as Code",
    "TOGAF",
    "ITIL",
    "DORA Compliance",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "151",
  url: SITE_URL,
  inLanguage: ["en", "fr", "de"],
};

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
