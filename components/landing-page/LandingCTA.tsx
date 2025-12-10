'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

interface LandingCTAProps {
  namespace: string;
  scanColor?: string;
  linesColor?: string;
}

export default function LandingCTA({
  namespace,
  scanColor = '#ffb3d9',
  linesColor = '#6b5566'
}: LandingCTAProps) {
  const t = useTranslations(`${namespace}.cta`);

  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* 网格背景 - 轻量级 CSS 实现 */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />

      {/* 扫描线动画 */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            ${scanColor} 2px,
            ${scanColor} 4px
          )`,
        }} />
      </div>

      {/* 动画光效 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-secondary/30 blur-2xl animate-pulse" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
            {/* 标题 */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 text-white">
              {t('title')}
            </h2>

            {/* 副标题 */}
            <p className="text-base sm:text-lg lg:text-xl text-text-muted mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>

            {/* 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#generator"
                className="group relative flex h-14 items-center justify-center px-10 rounded-xl bg-white text-gray-900 font-semibold transition-all duration-300 cursor-pointer w-full sm:w-auto hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="relative z-10">{t('primary')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
              <Link
                href="/pricing"
                className="group relative flex h-14 items-center justify-center px-10 rounded-xl border border-white/20 bg-white/5 text-white font-semibold transition-all duration-300 cursor-pointer w-full sm:w-auto hover:border-white/40 hover:bg-white/10 hover:-translate-y-0.5"
              >
                <span className="relative z-10">{t('secondary')}</span>
              </Link>
            </div>

            {/* 底部提示 */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-sm text-text-muted">
              <svg className="w-4 h-4 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('note')}</span>
            </div>
        </div>
      </div>
    </section>
  );
}
