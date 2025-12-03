import { siteConfig } from '@/config/site';
import { defaultLocale } from '@/i18n/config';

/**
 * 生成带语言前缀的路径
 * @param locale 语言代码
 * @param path 页面路径
 * @param isRootPath 是否为根路径
 * @returns 带语言前缀的路径
 */
function getLocalizedPath(locale: string, path: string, isRootPath: boolean): string {
  const isDefaultLocale = locale === defaultLocale;

  if (isRootPath) {
    return isDefaultLocale ? '/' : `/${locale}`;
  }

  return isDefaultLocale ? path : `/${locale}${path}`;
}

/**
 * 标准化路径，确保以 / 开头
 */
function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * 生成页面的 alternates 配置（canonical URL 和 hreflang 标签）
 * @param locale 当前页面的语言
 * @param path 页面路径（不包含 locale 前缀），例如: '/', '/help', '/pricing'
 * @returns alternates 配置对象
 */
export function generateAlternates(locale: string, path: string = '/') {
  const normalizedPath = normalizePath(path);
  const isRootPath = normalizedPath === '/';
  const isDefaultLocale = locale === defaultLocale;

  // 生成当前语言的完整路径
  const currentPath = getLocalizedPath(locale, normalizedPath, isRootPath);

  // 生成 canonical URL（默认语言的根路径不带斜杠）
  const canonical = isRootPath && isDefaultLocale
    ? siteConfig.url
    : `${siteConfig.url}${currentPath}`;

  // 生成所有语言版本的 URL（用于 hreflang 标签）
  const languages = Object.fromEntries(
    siteConfig.locales.map(l => [
      l,
      getLocalizedPath(l, normalizedPath, isRootPath),
    ])
  );

  return {
    canonical,
    languages,
  };
}
