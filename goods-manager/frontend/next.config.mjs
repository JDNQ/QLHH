/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3001' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
