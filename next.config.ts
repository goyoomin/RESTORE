import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_BASE_PATH || "",
  allowedDevOrigins: process.env.NEXT_DEV_ORIGIN ? [process.env.NEXT_DEV_ORIGIN] : [],
};

export default nextConfig;
