import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['jsdom', '@mozilla/readability', '@xmldom/xmldom'],
};

export default nextConfig;
