'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import FuzzyText from '@/components/FuzzyText';
import Footer from '@/components/layout/Footer';

export default function NotFoundClient() {
  const t = useTranslations('notFound');

  return (
    <div className="w-full flex flex-col bg-[#121216]">
      {/* 主内容区域 */}
      <div className="min-h-screen flex flex-col items-center justify-center gap-8">
        {/* 404 主标题 */}
        <FuzzyText
          fontSize="clamp(10rem, 25vw, 20rem)"
          baseIntensity={0.2}
          hoverIntensity={0.5}
          enableHover={true}
        >
          404
        </FuzzyText>

        {/* Not Found 副标题 */}
        <FuzzyText
          fontSize="clamp(1.8rem, 7vw, 7rem)"
          baseIntensity={0.2}
          hoverIntensity={0.5}
          enableHover={true}
        >
          not found
        </FuzzyText>

        {/* 按钮组 */}
        <div className="flex gap-4 mt-4">
          <Link
            href="/"
            className="flex h-12 items-center justify-center px-8 rounded-full bg-white hover:bg-gray-100 text-gray-900 font-medium transition-all cursor-pointer"
          >
            {t('buttons.home')}
          </Link>
          <Link
            href="/dashboard"
            className="flex h-12 items-center justify-center px-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all cursor-pointer"
          >
            {t('buttons.dashboard')}
          </Link>
        </div>
      </div>

      {/* Footer 组件 */}
      <Footer />
    </div>
  );
}
