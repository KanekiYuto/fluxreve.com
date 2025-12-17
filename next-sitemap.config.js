// 导入语言配置（与 i18n/config.ts 保持同步）
const { locales, defaultLocale } = require('./config/locales');

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

// 高价值语言配置（按消费能力和市场价值排序）
const highValueLocales = {
  en: 0.90,       // 英文 - 默认语言，全球消费能力最强
  de: 0.86,       // 德语 - 欧洲经济强国，消费能力高
  fr: 0.85,       // 法语 - 欧洲和非洲市场，消费能力高
  es: 0.83,       // 西班牙语 - 西班牙和拉美市场，消费能力中等偏高
  it: 0.82,       // 意大利语 - 欧洲发达国家，消费能力高
  sv: 0.81,       // 瑞典语 - 北欧富裕国家，人均消费能力最强
  no: 0.81,       // 挪威语 - 北欧富裕国家，人均消费能力最强
  da: 0.80,       // 丹麦语 - 北欧富裕国家，人均消费能力强
  fi: 0.80,       // 芬兰语 - 北欧富裕国家，人均消费能力强
  ar: 0.72,       // 阿拉伯语 - 中东市场，消费能力中等
  ja: 0.70,       // 日语 - 日本市场，消费能力强但市场饱和
  ko: 0.68,       // 韩语 - 韩国市场，消费能力较强
  'zh-TW': 0.62,  // 繁体中文 - 台湾、香港市场，消费能力较强
  'zh-CN': 0.60,  // 简体中文 - 中国市场，最低权重
};

// 静态页面路由
const staticRoutes = [
  '', // 首页
  '/help',
  '/ai-generator',
  '/pricing',
  '/explore',
  '/terms',
  '/privacy',
  // 模型专属页面
  '/nano-banana-pro',
  '/z-image',
  '/flux-2-pro',
  '/seedream-v45',
  '/gpt-image-15',
  // 工具页面
  '/image-upscaler',
  '/image-watermark-remover',
];

// Explore 页面的模型筛选路由
const exploreModelRoutes = [
  '/explore/nano-banana-pro',
  '/explore/nano-banana',
  '/explore/z-image',
  '/explore/z-image-lora',
  '/explore/flux-2-pro',
  '/explore/flux-schnell',
  '/explore/seedream-v4.5',
  '/explore/gpt-image-1.5',
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

    // 公开分享页面只需要默认语言版本，不需要多语言
    publicSharePages.forEach((route) => {
      paths.push({
        loc: route,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      });
    });

    // 静态页面生成所有语言版本
    locales.forEach((locale) => {
      staticRoutes.forEach((route) => {
        const isHome = route === '';
        const path = locale === defaultLocale
          ? route || '/'
          : `/${locale}${route}`;

        // 根据语言获取对应的权重，默认为 0.6
        const localePriority = highValueLocales[locale] || 0.6;

        paths.push({
          loc: path,
          changefreq: isHome ? 'daily' : 'weekly',
          priority: isHome ? 1.0 : localePriority,
          lastmod: new Date().toISOString(),
        });
      });

      // Explore 模型筛选页面生成所有语言版本
      exploreModelRoutes.forEach((route) => {
        const path = locale === defaultLocale
          ? route
          : `/${locale}${route}`;

        // 根据语言获取对应的权重，explore 页面使用稍低权重
        const localePriority = (highValueLocales[locale] || 0.6) * 0.85;

        paths.push({
          loc: path,
          changefreq: 'daily', // explore 页面内容更新较频繁
          priority: localePriority,
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
