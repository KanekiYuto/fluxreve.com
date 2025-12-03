// 语言配置（需要与 i18n/config.ts 保持同步）
const locales = ['en', 'zh-TW'];
const defaultLocale = 'en';

// 需要索引的页面路径
const routes = [
  '',
  '/help',
  '/ai-generator',
  '/pricing',
  '/terms',
  '/privacy',
];

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateRobotsTxt: true, // 生成 robots.txt 文件
  generateIndexSitemap: false, // 对于小型站点，不需要索引 sitemap
  exclude: ['/api/*', '/admin/*', '/dashboard', '/checkout', '/portal', '/settings', '/subscription', '/quota', '/v/*'], // 排除 API 路由、管理页面和需要登录的页面

  // 动态支持多语言
  alternateRefs: locales.map((locale) => ({
    href: locale === defaultLocale
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}`,
    hreflang: locale,
  })),

  // 添加额外的路径（因为使用了 [locale] 动态路由）
  additionalPaths: async (config) => {
    const paths = [];

    // 为每个语言生成所有路由
    locales.forEach((locale) => {
      routes.forEach((route) => {
        const path = locale === defaultLocale
          ? route || '/'
          : `/${locale}${route}`;

        paths.push({
          loc: path,
          changefreq: route === '' ? 'daily' : 'weekly',
          priority: route === '' ? 1.0 : 0.8,
          lastmod: new Date().toISOString(),
        });
      });
    });

    return paths;
  },

  // 默认配置
  changefreq: 'weekly',
  priority: 0.7,

  // robots.txt 配置
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard', '/checkout', '/portal', '/settings', '/subscription', '/quota'],
      },
    ],
  },
};
