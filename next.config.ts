import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The SQLite driver ships a native binary; keep it out of the bundler.
  serverExternalPackages: ["@libsql/client"],
  // Produces a self-contained .next/standalone folder for the Docker image.
  output: "standalone",
};

export default nextConfig;
