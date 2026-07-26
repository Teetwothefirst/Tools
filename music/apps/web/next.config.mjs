/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@music/ui", "@music/shared", "@music/types"],
};

export default nextConfig;

