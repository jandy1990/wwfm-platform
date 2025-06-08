import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
