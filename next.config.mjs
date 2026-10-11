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
export default withVercelToolbar(nextConfig);
