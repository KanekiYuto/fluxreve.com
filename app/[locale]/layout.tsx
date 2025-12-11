import type { Metadata } from "next";
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/react';
import { routing } from '@/i18n/routing';
import { rtlLocales } from '@/i18n/config';
import PageLayout from '@/components/layout/PageLayout';
import UserProvider from '@/components/providers/UserProvider';
import MarketingParamsProvider from '@/components/providers/MarketingParamsProvider';
import ModalProvider from '@/components/providers/ModalProvider';
import NavigationProgress from '@/components/providers/NavigationProgress';
import { siteConfig } from '@/config/site';
import "../globals.css";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    title: {
      template: `%s | ${siteConfig.name}`,
      default: siteConfig.name,
    },
    description: t('seo.description'),
    keywords: t('seo.keywords'),
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    robots: siteConfig.robots,
    metadataBase: siteConfig.url ? new URL(siteConfig.url) : undefined,
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/logo.png',
    },
    // 注意：alternates 应该在各个页面的 generateMetadata 中设置
    // 这样才能根据具体页面路径生成正确的语言链接
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const dir = rtlLocales.includes(locale as any) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className="antialiased">
        {/* Google Ads (gtag.js) - 延迟加载，避免阻塞首屏 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17790324344"
          strategy="lazyOnload"
        />
        <Script id="google-ads" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17790324344');
          `}
        </Script>

        {/* Microsoft Clarity - 延迟加载，避免阻塞首屏 */}
        <Script id="clarity-script" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uix23h7uxp");
          `}
        </Script>

        <NextIntlClientProvider locale={locale} messages={messages}>
          <MarketingParamsProvider>
            <UserProvider>
              <NavigationProgress />
              <PageLayout>{children}</PageLayout>
              <ModalProvider />
            </UserProvider>
          </MarketingParamsProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
