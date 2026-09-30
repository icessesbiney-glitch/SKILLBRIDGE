/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@skillbridge/shared"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  env: { NEXT_PUBLIC_SUPABASE_URL: "https://lhpdxsnsepvlhwkwsvel.supabase.co" }
};
export default nextConfig;
