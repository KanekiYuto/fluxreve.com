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
  const t = await getTranslations({ locale, namespace: 'privacy' });

  return {
    title: t('title', { siteName: siteConfig.name }),
    description: t('description', { siteName: siteConfig.name }),
    keywords: t('keywords'),
    alternates: generateAlternates(locale, '/privacy'),
  };
}

export default function PrivacyPage() {
  const t = useTranslations('privacy');

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
              {t('lastUpdated')}:{siteConfig.legal.privacyLastUpdated}
            </p>
          </div>

          <Divider variant="solid" className="mb-12" />

          {/* 隐私政策内容 */}
          <div className="prose prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                {t('introduction.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                {t('introduction.content1', { siteName: siteConfig.name })}
              </p>
              <p className="text-text-muted leading-relaxed">
                {t('introduction.content2', { siteName: siteConfig.name })}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                1. {t('dataCollection.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                {t('dataCollection.intro')}
              </p>

              <h3 className="text-xl font-semibold mb-3 text-white">
                1.1 {t('dataCollection.providedInfo.title')}
              </h3>
              <ul className="list-disc list-inside text-text-muted space-y-2 ml-4 mb-4">
                {(
                  t.raw('dataCollection.providedInfo.items') as string[]
                ).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white">
                1.2 {t('dataCollection.automaticInfo.title')}
              </h3>
              <ul className="list-disc list-inside text-text-muted space-y-2 ml-4 mb-4">
                {(
                  t.raw('dataCollection.automaticInfo.items') as string[]
                ).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white">
                1.3 {t('dataCollection.userContent.title')}
              </h3>
              <p className="text-text-muted leading-relaxed">
                {t('dataCollection.userContent.description')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                2. {t('dataUsage.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                {t('dataUsage.intro')}
              </p>
              <ul className="list-disc list-inside text-text-muted space-y-2 ml-4">
                {(t.raw('dataUsage.items') as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                3. {t('dataSharing.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                {t('dataSharing.intro')}
              </p>
              <ul className="list-disc list-inside text-text-muted space-y-2 ml-4">
                {(t.raw('dataSharing.items') as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                4. {t('dataStorage.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                4.1 {t('dataStorage.location')}
              </p>
              <p className="text-text-muted leading-relaxed mb-4">
                4.2 {t('dataStorage.duration')}
              </p>
              <p className="text-text-muted leading-relaxed">
                4.3 {t('dataStorage.security')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                5. {t('cookies.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                {t('cookies.intro')}
              </p>
              <ul className="list-disc list-inside text-text-muted space-y-2 ml-4 mb-4">
                {(t.raw('cookies.items') as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-text-muted leading-relaxed">
                {t('cookies.note')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                6. {t('userRights.title')}
              </h2>
              <p className="text-text-muted leading-relaxed mb-4">
                {t('userRights.intro')}
              </p>
              <ul className="list-disc list-inside text-text-muted space-y-2 ml-4">
                {(t.raw('userRights.items') as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                7. {t('thirdPartyLinks.title')}
              </h2>
              <p className="text-text-muted leading-relaxed">
                {t('thirdPartyLinks.content')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                8. {t('childrenPrivacy.title')}
              </h2>
              <p className="text-text-muted leading-relaxed">
                {t('childrenPrivacy.content')}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-white">
                9. {t('policyUpdates.title')}
              </h2>
              <p className="text-text-muted leading-relaxed">
                {t('policyUpdates.content')}
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
