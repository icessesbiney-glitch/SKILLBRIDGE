/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: false, tsconfigPath: './tsconfig.json' },
  eslint: { ignoreDuringBuilds: false },
};

module.exports = nextConfig;
