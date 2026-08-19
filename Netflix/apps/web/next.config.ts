import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.nflxext.com' },
    ],
  },
  transpilePackages: ['@netflix/shared-types'],
};

export default nextConfig;
