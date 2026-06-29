import type { NextConfig } from "next";

const SUPABASE_PROJECT_ID = "xnyvkmhqvoezqoebgdia"; // parsed from NEXT_PUBLIC_SUPABASE_URL

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage CDN — allows all objects in any public bucket
        // under this project, including the "images-b" gallery bucket.
        protocol: "https",
        hostname: `${SUPABASE_PROJECT_ID}.supabase.co`,
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
  experimental: {
    optimizePackageImports: ["react-icons", "framer-motion"],
  },
};

export default nextConfig;

