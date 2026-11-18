import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  
  images: {
  remotePatterns: [
    { protocol: "https", hostname: "blr1.digitaloceanspaces.com" },
  ],
},
  cacheComponents: true,
    devIndicators: false,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
