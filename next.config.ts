import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 75, 82],
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
