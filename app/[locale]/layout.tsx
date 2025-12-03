import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import PageLayout from '@/components/layout/PageLayout';
import UserProvider from '@/components/providers/UserProvider';
import ModalProvider from '@/components/providers/ModalProvider';
import NavigationProgress from '@/components/providers/NavigationProgress';
import { siteConfig } from '@/config/site';
import { locales, defaultLocale } from '@/i18n/config';
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

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <UserProvider>
            <NavigationProgress />
            <PageLayout>{children}</PageLayout>
            <ModalProvider />
          </UserProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
