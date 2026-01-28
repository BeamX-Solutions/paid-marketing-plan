import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'marketingplan.beamxsolutions.com',
          },
        ],
        destination: 'https://luna.beamxsolutions.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
