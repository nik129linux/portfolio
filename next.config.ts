import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // E2E builds go to their own folder so they never overwrite a running `next dev`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
