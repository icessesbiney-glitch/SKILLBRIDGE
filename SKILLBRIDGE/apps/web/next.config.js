const path = require('path');

module.exports = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
};
