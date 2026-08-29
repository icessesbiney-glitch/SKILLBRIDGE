/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allows production builds to successfully complete even if there are type warnings
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allows production builds to successfully complete even if there are linting warnings
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
