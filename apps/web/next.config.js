/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: "standalone",
  staticPagePrerenderTimeout: 10000,
  experimental: {
    missingSuspenseWithCSRBailout: false
  }
};

module.exports = nextConfig;
