import Script from 'next/script';
import Pricing from '@/components/pricing';
import FAQ from '@/components/FAQ';
import Divider from '@/components/Divider';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';

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
    alternates: generateAlternates(locale, '/pricing'),
  };
}

export default function PricingPage() {
  return (
    <>
      {/* Google Ads Conversion Tracking - 定价页浏览转换 */}
      <Script
        id="google-ads-pricing-conversion"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // 确保 gtag 已初始化，最多等待 3 秒
            let attempts = 0;
            const trackConversion = () => {
              if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                  'send_to': 'AW-17790324344/wPdWCJfKmNIbEPici6NC',
                  'value': 1.0,
                  'currency': 'CNY'
                });
              } else if (attempts < 30) {
                attempts++;
                setTimeout(trackConversion, 100);
              }
            };
            trackConversion();
          `,
        }}
      />
      <div className="min-h-screen">
        <Pricing useH1={true} />

        <Divider />

        <FAQ namespace="pricing" />
      </div>
    </>
  );
}
