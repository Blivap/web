import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Fast Refresh is enabled
  reactStrictMode: true,
  // Turbopack can be enabled via --turbo flag instead
  // This ensures Fast Refresh works properly
  // Allow any device to access the dev server
  allowedDevOrigins: ["*"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
