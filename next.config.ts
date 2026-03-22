import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: here,
  },
};

export default nextConfig;
