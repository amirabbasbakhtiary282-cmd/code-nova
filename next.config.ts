import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module — it must stay external to the
  // server bundler (Turbopack/webpack) and be required from node_modules.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
