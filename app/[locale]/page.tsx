import { Metadata } from 'next';
import Script from 'next/script';
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
  return (
    <>
      {/* Google Ads Conversion Tracking - 网页浏览转换 */}
      <Script
        id="google-ads-conversion"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // 确保 gtag 已初始化，最多等待 3 秒
            let attempts = 0;
            const trackConversion = () => {
              if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                  'send_to': 'AW-17790324344/yF9ACKjYmtAbEPici6NC',
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
      <HomeClient />
    </>
  );
}
