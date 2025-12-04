import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales } from '@/i18n/config';
import NotFoundClient from './not-found-client';
import "./globals.css";
import type { Metadata } from 'next';

// 设置 metadata 禁止搜索引擎收录
export const metadata: Metadata = {
  title: '404 - Page Not Found',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NotFound() {
  // 尝试从 cookies 中获取语言偏好
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');

  // 确定当前 locale
  let locale = defaultLocale;
  if (localeCookie?.value && locales.includes(localeCookie.value as any)) {
    locale = localeCookie.value as typeof defaultLocale;
  }

  // 使用 getMessages 获取翻译消息
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NotFoundClient />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
