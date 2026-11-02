/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo"
  }
};
