import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * All three workspace packages ship raw TypeScript source
   * ("main": "./src/index.ts") with no pre-compiled output.
   * Without this list Next.js (Turbopack or webpack) cannot resolve
   * them during a production build and throws "Module not found".
   */
  transpilePackages: [
    "@emakao/shared",
    "@emakao/api-client",
    "@emakao/api-types",
  ],
  turbopack: {
    // Keep Turbopack rooted at the frontend workspace so shared workspace
    // packages resolve consistently and Next.js stops inferring from lockfiles.
    root: path.join(process.cwd(), "../.."),
  },
  devIndicators: false,
};

export default nextConfig;
