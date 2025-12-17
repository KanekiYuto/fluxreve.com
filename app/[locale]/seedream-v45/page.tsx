import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import LandingContent from './LandingContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seedream-v45' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: generateAlternates(locale, '/seedream-v45'),
  };
}

export default function SeedreamV45Page() {
  return <LandingContent />;
}
