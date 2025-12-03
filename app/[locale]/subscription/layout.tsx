import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'subscription' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
  };
}

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
