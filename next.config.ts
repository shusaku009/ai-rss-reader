import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['@xmldom/xmldom'],
};

export default nextConfig;
