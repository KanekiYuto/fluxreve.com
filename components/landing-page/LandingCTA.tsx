'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import dynamic from 'next/dynamic';

const GridScan = dynamic(() => import('@/components/GridScan').then(mod => ({ default: mod.GridScan })), {
  ssr: false,
  loading: () => <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
});

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
      {/* GridScan 背景特效 */}
      <div className="absolute inset-0 w-full h-full">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor={linesColor}
          gridScale={0.1}
          scanColor={scanColor}
          scanOpacity={0.5}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
          className="w-full h-full"
        />
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
