/**
 * Google Ads Conversion Tracking Component
 * 用于追踪特定转换事件，如页面浏览
 */

interface GoogleAdsConversionProps {
  conversionId: string;
  value?: number;
  currency?: string;
}

export default function GoogleAdsConversion({
  conversionId,
  value = 5.0,
  currency = 'USD',
}: GoogleAdsConversionProps) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
              'send_to': '${conversionId}',
              'value': ${value},
              'currency': '${currency}'
            });
          }
        `,
      }}
    />
  );
}
