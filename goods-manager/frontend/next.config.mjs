/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid noisy `*.map` 404s in devtools when source maps aren’t available.
  // Next will skip generating client source maps.
  productionBrowserSourceMaps: false,
  // Extra safety: make sure source maps are not exposed/served.
  // (If Next still tries to look for them in some setups, they won’t 404.)
  headers: async () => {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "X-SourceMaps",
            value: "disabled",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3001" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
