'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Divider from '@/components/Divider';
import Pricing from '@/components/pricing';
import PrismaticBurst from '@/components/PrismaticBurst';

export default function Home() {
  const t = useTranslations('home');

  // 获取特性列表数据
  const featuresData = t.raw('features.items') as Array<{
    title: string;
    description: string;
  }>;

  const featureIcons = [
    <svg key="0" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>,
    <svg key="1" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>,
    <svg key="2" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>,
    <svg key="3" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>,
  ];

  const features = featuresData.map((feature, index) => ({
    icon: featureIcons[index],
    title: feature.title,
    description: feature.description,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden">
        {/* Prismatic Burst 背景 */}
        <div className="absolute inset-0">
          <PrismaticBurst
            intensity={1.5}
            speed={0.3}
            animationType="rotate3d"
            colors={['#6633FF', '#8866ff', '#aa99ff', '#7d4dff']}
            distort={3}
            rayCount={12}
            mixBlendMode="lighten"
          />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">{t('hero.badge')}</span>
            </div>

            {/* 主标题 */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-text-muted bg-clip-text text-transparent">
                {t('hero.title.line1')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">
                {t('hero.title.line2')}
              </span>
            </h1>

            {/* 描述 */}
            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
              {t('hero.description')}
            </p>

            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                className="flex h-12 items-center justify-center px-8 rounded-full bg-white hover:bg-gray-100 text-gray-900 font-medium transition-all cursor-pointer"
                href="/dashboard"
              >
                <span>{t('hero.buttons.startCreate')}</span>
              </Link>
              <Link
                className="flex h-12 items-center justify-center px-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium transition-all cursor-pointer"
                href="/projects"
              >
                <span>{t('hero.buttons.viewExamples')}</span>
              </Link>
            </div>

            {/* 特性标签 */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('hero.features.highQuality')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('hero.features.fastGeneration')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('hero.features.easyToUse')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* 特性区域 */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* 区块标题 */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t('features.sectionTitle')}
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              {t('features.sectionDescription')}
            </p>
          </div>

          {/* 特性网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-bg-elevated border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
              >
                {/* 背景光效 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-start gap-4">
                  {/* 图标 */}
                  <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* 定价区域 */}
      <Pricing />

      <Divider />

      {/* CTA 区域 */}
      <section className="w-full">
        <div className="relative overflow-hidden bg-bg-elevated p-12 md:p-20">
            {/* 网格背景 */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]" />

            {/* 渐变光效 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
            </div>

            <div className="relative text-center">
              {/* 图标装饰 */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                {t('cta.title')}
              </h2>
              <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
                {t('cta.description')}
              </p>

              {/* 按钮组 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/ai-generator"
                  className="flex h-12 items-center justify-center px-8 rounded-full bg-white hover:bg-gray-100 text-gray-900 font-medium transition-all cursor-pointer"
                >
                  <span>{t('cta.buttons.freeTrial')}</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex h-12 items-center justify-center px-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium transition-all cursor-pointer"
                >
                  <span>{t('cta.buttons.viewExamples')}</span>
                </Link>
              </div>

              {/* 底部提示 */}
              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-text-dim">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('cta.note')}</span>
              </div>
            </div>
        </div>
      </section>
    </div>
  );
}
