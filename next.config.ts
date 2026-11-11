import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module — it must stay external to the
  // server bundler (Turbopack/webpack) and be required from node_modules.
  serverExternalPackages: ["better-sqlite3"],
  // Arena serves the dev preview from a wildcard e2b.app origin; Next blocks
  // those cross-origin dev assets unless the preview hostname is allowed.
  allowedDevOrigins: ["*.e2b.app"],
  experimental: {
    serverActions: {
      // This exception is limited to dev previews. Production relies on the
      // reverse proxy forwarding its public host as x-forwarded-host.
      allowedOrigins: process.env.NODE_ENV === "development" ? ["*.e2b.app"] : [],
    },
  },
};

export default nextConfig;
