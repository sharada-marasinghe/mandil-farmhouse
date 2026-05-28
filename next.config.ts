import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
  experimental: {
    optimizePackageImports: ["react-icons", "framer-motion"],
  },
};

export default nextConfig;
