import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // ETG hotel photo CDNs — extend when real API responses are captured
      { protocol: "https", hostname: "cdn.worldota.net" },
      { protocol: "https", hostname: "photo.hotellook.com" },
    ],
  },
};

export default nextConfig;
