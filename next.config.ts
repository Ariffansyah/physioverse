import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.arpthef.my.id"],
  experimental: {
    serverActions: { allowedOrigins: ["*.arpthef.my.id"] },
  },
};

export default nextConfig;
