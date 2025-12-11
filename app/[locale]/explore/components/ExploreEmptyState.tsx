'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function ExploreEmptyState() {
  const t = useTranslations('explore');

  return (
    <div className="text-center py-20">
      {/* 空状态图标 */}
      <div className="flex justify-center mb-6">
        <svg className="w-20 h-20 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      {/* 文案 */}
      <h3 className="text-2xl font-bold text-white mb-2">{t('empty.title')}</h3>
      <p className="text-text-muted mb-8 max-w-md mx-auto">{t('empty.subtitle')}</p>

      {/* CTA 按钮 */}
      <Link
        href="/ai-generator"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {t('empty.cta')}
      </Link>
    </div>
  );
}
