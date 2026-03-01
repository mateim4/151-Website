import type { Metadata } from "next";
import { poppins, inter, ibmPlexMono } from "@/lib/fonts";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "151 | Senior Infrastructure Architecture",
    template: "%s",
  },
  description:
    "Elite infrastructure design, automation, and Technical Design Authority consulting. Based in Luxembourg.",
  metadataBase: new URL(process.env.SITE_URL ?? "https://151.lu"),
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
