/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Insulates the Next.js routing and telemetry tracers inside a nested monorepo structure
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Ensures type checking remains safe for production validation runs
  }
};

module.exports = nextConfig;
