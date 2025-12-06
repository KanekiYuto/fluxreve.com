import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // 禁用 source map 警告
  productionBrowserSourceMaps: false,

  // 重写规则（用于 AI SEO）
  async rewrites() {
    return [
      // .well-known 目录下的 AI SEO 文件
      {
        source: '/.well-known/llms.txt',
        destination: '/llms.txt',
      },
      {
        source: '/.well-known/llms-full.txt',
        destination: '/llms-full.txt',
      },
      {
        source: '/.well-known/ai.txt',
        destination: '/ai.txt',
      },
    ];
  },

  // Webpack 配置
  webpack: (config, { dev, isServer }) => {
    // 开发环境下忽略 source map 警告
    if (dev) {
      config.ignoreWarnings = [
        { module: /node_modules/ },
        /Failed to parse source map/,
      ];
    }

    // 忽略 Node.js 特定模块（用于客户端组件）
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        encoding: false,
      };
    }

    return config;
  },
};

export default withNextIntl(nextConfig);
