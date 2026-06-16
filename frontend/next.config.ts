import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.1.*", "localhost", "10.1.19.*"],
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        hostname: "localhost",
        port: "5050",
        protocol: "http",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;