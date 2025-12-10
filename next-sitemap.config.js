// 语言配置（需要与 i18n/config.ts 保持同步）
const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ar', 'fr', 'de'];
const defaultLocale = 'en';

// 需要登录或不需要索引的路径
const excludePaths = [
  '/api/*',
  '/admin/*',
  '/dashboard',
  '/tasks',
  '/checkout',
  '/portal',
  '/settings',
  '/subscription',
  '/quota',
  '/task/*', // 用户私有任务详情页
];

// robots.txt 禁止爬取的路径
const disallowPaths = [
  '/api/',
  '/admin/',
  '/dashboard',
  '/tasks',
  '/checkout',
  '/portal',
  '/settings',
  '/subscription',
  '/quota',
  '/task/', // 用户私有任务详情页
];

// 静态页面路由
const staticRoutes = [
  '', // 首页
  '/help',
  '/ai-generator',
  '/pricing',
  '/terms',
  '/privacy',
  // 模型专属页面
  '/nano-banana-pro',
  '/z-image',
  '/flux-2-pro',
  '/seedream-v45',
];

// 从预生成的 JSON 文件读取公开分享的任务链接
function getPublicSharePages() {
  try {
    const fs = require('fs');
    const path = require('path');
    const tasksPath = path.join(__dirname, '.next-sitemap-tasks.json');
    
    // 如果文件不存在，返回空数组
    if (!fs.existsSync(tasksPath)) {
      console.warn('⚠️  未找到公开任务列表文件，请先运行: pnpm generate:sitemap-tasks');
      return [];
    }
    
    const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
    console.log(`✅ 成功加载 ${tasks.length} 个公开任务链接`);
    return tasks;
  } catch (error) {
    console.error('❌ 读取公开任务列表失败:', error);
    return [];
  }
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: false, // 小型站点不需要索引 sitemap
  exclude: excludePaths,

  // 多语言 alternate refs
  alternateRefs: locales.map((locale) => ({
    href: locale === defaultLocale
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}`,
    hreflang: locale,
  })),

  // 生成所有语言版本的路径
  additionalPaths: async () => {
    const paths = [];

    // 获取公开分享页面
    const publicSharePages = getPublicSharePages();
    
    // 合并所有路由
    const allRoutes = [...staticRoutes, ...publicSharePages];

    locales.forEach((locale) => {
      allRoutes.forEach((route) => {
        const isHome = route === '';
        const isSharePage = route.startsWith('/t/');
        const path = locale === defaultLocale
          ? route || '/'
          : `/${locale}${route}`;

        paths.push({
          loc: path,
          changefreq: isHome ? 'daily' : isSharePage ? 'monthly' : 'weekly',
          priority: isHome ? 1.0 : isSharePage ? 0.6 : 0.8,
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
        disallow: disallowPaths,
      },
      // AI 爬虫友好配置
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Anthropic-AI',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: disallowPaths,
      },
    ],
    // 添加额外的指令
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL}/llms.txt`,
    ],
  },
};
