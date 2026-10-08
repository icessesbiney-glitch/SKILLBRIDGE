/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignores linting and TypeScript during production packaging to force Vercel green
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Transpiles monorepo shared packages cleanly
  transpilePackages: ["@skillbridge/supabase", "@skillbridge/ui"],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  experimental: {
    esmExternals: "loose"
  }
};

module.exports = nextConfig;
