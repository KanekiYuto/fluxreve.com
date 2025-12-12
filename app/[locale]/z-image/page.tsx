import { Metadata } from 'next';
import Script from 'next/script';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import LandingContent from './LandingContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'zImage.seo' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: generateAlternates(locale, '/z-image'),
  };
}

export default function ZImagePage() {
  return (
    <>
      {/* Google Ads Conversion Tracking - 放在 head 中，在 Google Ads 脚本之后执行 */}
      <Script
        id="google-ads-conversion"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof gtag !== 'undefined') {
              gtag('event', 'conversion', {
                'send_to': 'AW-17790324344/3nVPCOWCmtAbEPici6NC',
                'value': 5.0,
                'currency': 'USD'
              });
            }
          `,
        }}
      />
      <LandingContent />
    </>
  );
}
