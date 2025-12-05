'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LiquidEther from '@/components/LiquidEther';

interface LandingHeroProps {
  namespace: string;
  colors?: string[];
  stats?: string[];
}

export default function LandingHero({
  namespace,
  colors = ['#ff6b9d', '#ffb3d9', '#ff85b3', '#ffc9e0'],
  stats = ['speed', 'quality', 'affordable']
}: LandingHeroProps) {
  const t = useTranslations(`${namespace}.hero`);

  return (
    <section className="relative overflow-hidden">
      {/* LiquidEther 流体背景 */}
      <div className="absolute inset-0">
        <LiquidEther
          mouseForce={20}
          cursorSize={100}
          colors={colors}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          className="w-full h-full"
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* 标签 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-primary">{t('badge')}</span>
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-white to-text-muted bg-clip-text text-transparent">
              {t('title.line1')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">
              {t('title.line2')}
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-base sm:text-lg md:text-xl text-text-muted max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0">
            {t('subtitle')}
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 max-w-md mx-auto sm:max-w-none">
            <a
              href="#generator"
              className="flex h-11 sm:h-12 items-center justify-center px-6 sm:px-8 rounded-full bg-white hover:bg-gray-100 text-gray-900 font-medium transition-all cursor-pointer"
            >
              <span>{t('cta.primary')}</span>
            </a>
            <Link
              href="#generator"
              className="flex h-11 sm:h-12 items-center justify-center px-6 sm:px-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium transition-all cursor-pointer"
            >
              <span>{t('cta.secondary')}</span>
            </Link>
          </div>

          {/* 特性标签 */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-text-muted">
            {stats.map((stat) => (
              <div key={stat} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t(`stats.${stat}.label`)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
