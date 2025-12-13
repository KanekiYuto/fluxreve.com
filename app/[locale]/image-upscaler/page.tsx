import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import LandingContent from './LandingContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'imageUpscaler.seo' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: generateAlternates(locale, '/image-upscaler'),
  };
}

export default function ImageUpscalerPage() {
  return <LandingContent />;
}
