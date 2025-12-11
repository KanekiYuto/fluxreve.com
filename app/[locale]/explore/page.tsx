import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import ExploreGallery from './components/ExploreGallery';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'explore.seo' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: generateAlternates(locale, '/explore'),
  };
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-bg">
      <ExploreGallery />
    </div>
  );
}
