import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config/site';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help' });

  return {
    title: t('seo.title'),
    description: t('seo.description', { siteName: siteConfig.name }),
  };
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
