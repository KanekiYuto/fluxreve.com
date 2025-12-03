import Pricing from '@/components/pricing';
import FAQ from '@/components/FAQ';
import Divider from '@/components/Divider';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Pricing />

      <Divider />

      <FAQ namespace="pricing" />
    </div>
  );
}
