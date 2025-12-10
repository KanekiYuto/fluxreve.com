'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import useModalStore from '@/store/useModalStore';

export default function MarketingCard() {
  const t = useTranslations('dashboard.marketing');
  const { openSubscriptionModal } = useModalStore();

  return (
    <div className="lg:col-span-3 rounded-xl gradient-border bg-gradient-to-br from-primary/5 via-secondary/5 to-purple-500/5">
      <div className="flex flex-col md:flex-row items-center justify-between h-full p-6 gap-6">
        {/* 左侧文本内容 */}
        <div className="flex-1 text-center md:text-left">
          {/* 标题 */}
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            {t('title')}
          </h3>

          {/* 描述 */}
          <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* 右侧按钮组 */}
        <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[200px]">
          <button
            onClick={openSubscriptionModal}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold text-center cursor-pointer"
          >
            {t('upgradeButton')}
          </button>
          <Link
            href="/ai-generator"
            className="px-6 py-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-white text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all text-center"
          >
            {t('learnMoreButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}
