import type { NextConfig } from "next";
import "./src/env"; // Validate environment variables at build time

const config: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Transpile shared packages from the monorepo
  transpilePackages: ["@truss/ui"],

  // Enable turbopack in dev mode (already enabled via CLI, but documented here)
  // Run with: next dev --turbopack
};

export default config;
