import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Electron renderer: static export (out/) — no server runs, everything goes over IPC.
  output: "export",
  // Loaded over file://, so relative paths are required.
  assetPrefix: "./",
  images: { unoptimized: true },
};

export default nextConfig;
