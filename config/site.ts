import { locales } from '@/i18n/config';

// 站点配置
export const siteConfig = {
  name: 'FluxReve',
  nameShort: 'F', // 侧边栏收缩时显示的简短名称
  url: process.env.NEXT_PUBLIC_SITE_URL,

  // SEO 元信息
  author: 'FluxReve Team',
  creator: 'FluxReve',
  publisher: 'FluxReve',
  robots: 'index, follow',

  // OpenGraph 配置
  openGraph: {
    siteName: 'FluxReve',
    type: 'website' as const,
  },

  // 支持的语言列表（从 i18n 配置导入）
  locales,

  // Twitter 配置
  twitter: {
    site: '@FluxReve',
    creator: '@FluxReve',
    card: 'summary_large_image' as const,
  },

  // 联系方式
  contact: {
    email: 'support@fluxreve.com',
  },

  // 社交媒体链接
  social: {
    telegram: 'https://t.me/+_fuj3YZDcStmMjll',
    discord: 'https://discord.gg/6QynZPsU',
  },

  // 法律信息
  legal: {
    termsLastUpdated: '2025-11-27',
    privacyLastUpdated: '2025-11-27',
  }
};

