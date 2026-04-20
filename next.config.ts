import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      // Allow /api/chat/widget.js as a clean URL for the embeddable script
      { source: "/api/chat/widget.js", destination: "/api/chat/widget-script" },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff"        },
          { key: "X-Frame-Options",            value: "SAMEORIGIN"     },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Cache static assets aggressively — Next.js hashes these so it's safe
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(favicon\\.ico|robots\\.txt|sitemap\\.xml)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      // CORS for embeddable chat widget and public landing page forms
      {
        source: "/api/chat/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      {
        source: "/api/pages/:path*/submit",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
  // Compress responses
  compress: true,
  // Don't expose source maps to users in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
