import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // 禁用 source map 警告
  productionBrowserSourceMaps: false,

  // Webpack 配置
  webpack: (config, { dev, isServer }) => {
    // 开发环境下忽略 source map 警告
    if (dev) {
      config.ignoreWarnings = [
        { module: /node_modules/ },
        /Failed to parse source map/,
      ];
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
