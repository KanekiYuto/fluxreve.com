import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { getSiteUrl } from '@/lib/urls';

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
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    });
  });

  return urls;
}
