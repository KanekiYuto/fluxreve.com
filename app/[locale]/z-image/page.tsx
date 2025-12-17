import { Metadata } from 'next';
import Script from 'next/script';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import LandingContent from './LandingContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'z-image' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: generateAlternates(locale, '/z-image'),
  };
}

export default function ZImagePage() {
  return <LandingContent />;
}
