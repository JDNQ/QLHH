/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const apiOrigin = new URL(apiUrl).origin;

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

  rewrites: async () => {
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiOrigin}/uploads/:path*`,
      },
    ];
  },

  // Allow images served by the backend upload folder.
  images: {
    localPatterns: [
      { pathname: "/uploads/**", search: "" },
      { pathname: "/assets/**", search: "" },
      { pathname: "/assets/images/**", search: "" },
    ],
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3001" },
      { protocol: "http", hostname: "127.0.0.1", port: "3001" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
