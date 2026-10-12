import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project is nested inside a wider workspace that also has a lockfile.
  // Pin Turbopack to this application so development and production builds use
  // the correct dependency tree.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
