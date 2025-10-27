import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v3/:path*",
        destination: "https://api.buzfi.com/api/v3/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'buzfi.nyc3.cdn.digitaloceanspaces.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.ckbproducts.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
