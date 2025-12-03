import { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/config';
import { getSiteUrl } from '@/lib/urls';

// 强制静态生成
export const dynamic = 'force-static';
export const revalidate = 3600; // 每小时重新验证一次

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl()

  // 需要索引的页面路径
  const routes = [
    '', // 首页
    '/help',
    '/ai-generator',
    '/pricing',
    '/terms',
    '/privacy',
  ];

  // 为每个语言版本生成 URL
  const urls: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      // 默认语言不添加语言前缀
      const localePath = locale === defaultLocale ? '' : `/${locale}`;
      urls.push({
        url: `${baseUrl}${localePath}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    });
  });

  return urls;
}
