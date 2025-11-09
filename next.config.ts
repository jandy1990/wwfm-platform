import type { NextConfig } from "next";
import path from "path";
// Sentry removed - uncomment and run `npm install @sentry/nextjs` to re-enable
// import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Set the workspace root to silence lockfile warning
  outputFileTracingRoot: path.join(__dirname),

  webpack: (config) => {
    // Standard webpack configuration
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/archive/**']
    }
    return config
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js']
};

// Sentry configuration commented out - re-enable by installing @sentry/nextjs
// export default process.env.NODE_ENV === 'production'
//   ? withSentryConfig(nextConfig, {
//       org: "wwfm",
//       project: "javascript-nextjs",
//       silent: !process.env.CI,
//       widenClientFileUpload: true,
//       tunnelRoute: "/monitoring",
//       disableLogger: true,
//       automaticVercelMonitors: true,
//     })
//   : nextConfig;

export default nextConfig;