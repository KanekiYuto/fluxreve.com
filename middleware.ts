import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  // 支持的所有语言
  locales,

  // 默认语言
  defaultLocale,

  // URL 策略:
  // - 'always': 总是显示语言前缀 (/en/page)
  // - 'as-needed': 默认语言不显示前缀 (/page), 其他语言显示 (/zh/page)
  // - 'never': 从不显示前缀 (需要其他方式检测语言)
  localePrefix: 'as-needed',

  // 自动语言检测（基于 Cookie、Accept-Language header）
  localeDetection: true,

  // 使用 alternate links 来记住语言偏好
  alternateLinks: true,
});

export async function middleware(request: NextRequest) {
  console.log(request)

  // 处理 i18n 路由
  return intlMiddleware(request);
}

export const config = {
  // 匹配所有路径，除了:
  // - API 路由 (/api/*)
  // - Next.js 内部路由 (/_next/*)
  // - Vercel 路由 (/_vercel/*)
  // - .well-known 目录 (/.well-known/*)
  // - 静态资源 (带扩展名的文件，如 .js, .css, .png 等)
  matcher: [
    '/((?!api|_next|_vercel|\\.well-known|.*\\.[a-zA-Z0-9]+$).*)'
  ],
};
