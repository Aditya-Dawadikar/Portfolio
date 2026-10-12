import { withSentryConfig } from "@sentry/nextjs/config";
import createWithVercelToolbar from "@vercel/toolbar/plugins/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The landing page and /home were merged into a single page at /.
    return [{ source: "/home", destination: "/", permanent: true }];
  },
  webpack(config, { isServer }) {
    // @vercel/flags-core optionally imports this module, which only exists when Vercel
    // embeds flag definitions at build time. Leave it to a runtime require so webpack
    // doesn't fail when it's absent; flags-core falls back to fetching definitions.
    if (isServer) {
      config.externals.push({ "@vercel/flags-definitions": "commonjs @vercel/flags-definitions" });
    }
    return config;
  },
};

const withVercelToolbar = createWithVercelToolbar();

// SENTRY_ORG, SENTRY_PROJECT and SENTRY_AUTH_TOKEN are provided by the Vercel Sentry integration.
export default withSentryConfig(withVercelToolbar(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Route browser events through the app so ad blockers don't drop them
  tunnelRoute: "/sentry-tunnel",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
});
