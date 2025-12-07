import Divider from '@/components/Divider';
import { siteConfig } from '@/config/site';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });

  return {
    title: t('title', { siteName: siteConfig.name }),
    description: t('description', { siteName: siteConfig.name }),
    keywords: t('keywords'),
    alternates: generateAlternates(locale, '/terms'),
  };
}

export default function TermsPage() {
  const t = useTranslations('terms');

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {t('title', { siteName: siteConfig.name })}
            </h1>
            <p className="text-text-muted">
              {t('lastUpdated')}:{siteConfig.legal.termsLastUpdated}
            </p>
          </div>

          <Divider variant="solid" className="mb-12" />

          {/* 协议内容 */}
          <div className="prose prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                1. {t('acceptance.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                {t('acceptance.content1', { siteName: siteConfig.name })}
              </p>
              <p className="text-text-muted leading-relaxed">
                {t('acceptance.content2')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                2. {t('serviceDescription.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                {t('serviceDescription.intro', { siteName: siteConfig.name })}
              </p>
              <ul className="list-disc list-inside text-text-muted space-y-2 ml-4">
                {(t.raw('serviceDescription.items') as string[]).map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                3. {t('userAccount.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                3.1 {t('userAccount.registration')}
              </p>
              <p className="text-text-muted leading-relaxed mb-4">
                3.2 {t('userAccount.security')}
              </p>
              <p className="text-text-muted leading-relaxed">
                3.3 {t('userAccount.transfer')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                4. {t('usageRules.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                {t('usageRules.intro')}
              </p>
              <ul className="list-disc list-inside text-text-muted space-y-2 ml-4">
                {(t.raw('usageRules.items') as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                5. {t('intellectualProperty.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                5.1 {t('intellectualProperty.platformContent', { siteName: siteConfig.name })}
              </p>
              <p className="text-text-muted leading-relaxed mb-4">
                5.2 {t('intellectualProperty.userContent')}
              </p>
              <p className="text-text-muted leading-relaxed">
                5.3 {t('intellectualProperty.license')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                6. {t('privacy.title')}
              </h2>
              <p className="text-text-muted leading-relaxed">
                {t('privacy.content')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                7. {t('serviceChanges.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                7.1 {t('serviceChanges.modification')}
              </p>
              <p className="text-text-muted leading-relaxed mb-4">
                7.2 {t('serviceChanges.termination')}
              </p>
              <p className="text-text-muted leading-relaxed">
                7.3 {t('serviceChanges.dataRetention')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                8. {t('disclaimer.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                8.1 {t('disclaimer.asIs')}
              </p>
              <p className="text-text-muted leading-relaxed mb-4">
                8.2 {t('disclaimer.liability', { siteName: siteConfig.name })}
              </p>
              <p className="text-text-muted leading-relaxed">
                8.3 {t('disclaimer.responsibility')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                9. {t('legalJurisdiction.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                9.1 {t('legalJurisdiction.law', { siteName: siteConfig.name })}
              </p>
              <p className="text-text-muted leading-relaxed">
                9.2 {t('legalJurisdiction.disputes')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                10. {t('contact.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                {t('contact.intro')}
              </p>
              <p className="text-text-muted leading-relaxed">
                {t('contact.email')}:{siteConfig.contact.email}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
