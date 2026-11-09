import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Coolify image (.next/standalone + server.js).
  output: "standalone",
  experimental: {
    agentFeedback: true,
    // Occurrence forms send up to 5 images through the Nginx proxy.
    proxyClientMaxBodySize: "20mb",
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
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
