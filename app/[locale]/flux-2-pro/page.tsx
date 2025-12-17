import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import LandingContent from './LandingContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'flux-2-pro' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: generateAlternates(locale, '/flux-2-pro'),
  };
}

export default function Flux2ProPage() {
  return <LandingContent />;
}
