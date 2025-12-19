import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generateAlternates } from '@/lib/metadata';
import Divider from '@/components/Divider';
import CaseGenerator from '@/components/case-generator/CaseGenerator';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ghibli' });

  return {
    title: t('seo.title'),
    description: t('seo.description'),
    alternates: generateAlternates(locale, '/ghibli'),
  };
}

// 吉卜力风格案例数据
const showcaseImages = [
  {
    id: 1,
    prompt: 'A peaceful countryside village in Ghibli style, with rolling hills, traditional Japanese houses, and a clear blue sky',
    style: 'ghibli',
  },
  {
    id: 2,
    prompt: 'A magical forest with giant trees and floating spirits, Studio Ghibli aesthetic, soft lighting and dreamy atmosphere',
    style: 'ghibli',
  },
  {
    id: 3,
    prompt: 'A cozy cafe interior in Ghibli animation style, warm lighting, plants by the window, wooden furniture',
    style: 'ghibli',
  },
  {
    id: 4,
    prompt: 'A young girl with a red bow standing on a hill overlooking the ocean, Ghibli style, sunset colors',
    style: 'ghibli',
  },
  {
    id: 5,
    prompt: 'A train station platform in the rain, Ghibli anime style, nostalgic mood, soft colors',
    style: 'ghibli',
  },
  {
    id: 6,
    prompt: 'A magical castle floating in the clouds, Studio Ghibli inspired, whimsical and enchanting',
    style: 'ghibli',
  },
];

export default async function GhibliShowcasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ghibli' });

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-bg-elevated to-bg py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-5xl mx-auto">

            {/* 主标题 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {t('page.title')}
            </h1>

            {/* 副标题 */}
            <p className="text-base sm:text-lg text-text-muted mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('page.subtitle')}
            </p>
          </div>

        </div>

        {/* 生成器组件 */}
        <div className="mt-8 lg:mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CaseGenerator />
        </div>
      </section>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* 介绍部分 */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t('page.whatIsTitle')}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-bg-elevated rounded-xl p-6 border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('page.classicAesthetics')}</h3>
                <p className="text-text-muted leading-relaxed">
                  {t('page.classicDescription')}
                </p>
              </div>

              <div className="bg-bg-elevated rounded-xl p-6 border border-border">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('page.aiMagic')}</h3>
                <p className="text-text-muted leading-relaxed">
                  {t('page.aiDescription')}
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>

      <Divider />

      {/* CTA 部分 */}
      <section className="w-full">
        <div className="relative overflow-hidden bg-bg-elevated p-12 md:p-20">
          {/* 渐变光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-bg-elevated to-secondary/10 opacity-50" />
          <div className="absolute -top-1/3 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/3 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

          <div className="relative text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              {t('cta.title')}
            </h2>
            <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('cta.description')}
            </p>

            {/* 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/ai-generator"
                className="flex h-12 items-center justify-center px-8 rounded-full bg-white hover:bg-gray-100 text-gray-900 font-medium transition-all cursor-pointer"
              >
                <span>{t('cta.buttonPrimary')}</span>
              </a>
              <a
                href="/pricing"
                className="flex h-12 items-center justify-center px-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium transition-all cursor-pointer"
              >
                <span>{t('cta.buttonSecondary')}</span>
              </a>
            </div>

            {/* 底部提示 */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-text-dim">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('cta.noCreditCard')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
