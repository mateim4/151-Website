import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";
import createNextIntlPlugin from "next-intl/plugin";

const __projectDir = dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://192.168.50.40:3000"],
  output: "standalone",
  turbopack: {
    root: __projectDir,
  },
  transpilePackages: ["@alchemy-ui/core"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
