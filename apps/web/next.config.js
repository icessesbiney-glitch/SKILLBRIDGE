/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: "standalone",
  staticPageGenerationTimeout: 1200,
  experimental: {
    missingSuspenseWithCSRBailout: false
  }
};

module.exports = nextConfig;
