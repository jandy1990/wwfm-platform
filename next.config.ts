import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set the workspace root to silence lockfile warning
  outputFileTracingRoot: path.join(__dirname),

  webpack: (config) => {
    // Exclude duplicate directories from compilation
    config.watchOptions = {
      ignored: ['**/wwfm-platform-OLD/**', '**/wwfm-platform/**', '**/node_modules']
    }
    return config
  },
  // Exclude duplicate directories from build scanning
  pageExtensions: ['tsx', 'ts', 'jsx', 'js']
};

export default nextConfig;
