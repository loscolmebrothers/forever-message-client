/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    // Exclude canvas from bundle (Konva tries to import it for server-side rendering)
    config.externals = [...(config.externals || []), { canvas: "canvas" }];

    // Fix for wagmi/RainbowKit SSR issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Ignore optional dependencies that cause warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/pino/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
