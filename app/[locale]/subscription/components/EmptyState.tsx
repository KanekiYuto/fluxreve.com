'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

/**
 * 无订阅状态组件
 */
export default function EmptyState() {
  const t = useTranslations('subscription.empty');

  return (
    <div className="bg-bg-elevated rounded-2xl p-8 sm:p-12 border border-border text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      </div>
      <div className="text-lg sm:text-xl font-semibold text-white mb-2">{t('title')}</div>
      <p className="text-sm sm:text-base text-text-muted mb-6">{t('description')}</p>
      <Link
        href="/pricing"
        className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg gradient-bg text-white text-sm sm:text-base font-semibold hover:scale-105 transition-transform cursor-pointer"
      >
        {t('action')}
      </Link>
    </div>
  );
}
