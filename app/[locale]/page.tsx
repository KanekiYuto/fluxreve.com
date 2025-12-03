import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config/site';
import { generateAlternates } from '@/lib/metadata';
import HomeClient from './HomeClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: {
      absolute: t('metadata.title', { siteName: siteConfig.name }),
    },
    description: t('metadata.description'),
    alternates: generateAlternates(locale, '/'),
  };
}

export default async function Home() {
  return <HomeClient />;
}
