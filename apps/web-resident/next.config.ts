import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@emakao/shared", "@emakao/api-types"],
};

export default nextConfig;
