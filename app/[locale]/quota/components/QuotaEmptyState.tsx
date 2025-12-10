'use client';

import { useTranslations } from 'next-intl';

interface QuotaEmptyStateProps {
  type: 'active' | 'expired';
}

export default function QuotaEmptyState({ type }: QuotaEmptyStateProps) {
  const t = useTranslations('quota');

  return (
    <div className="relative rounded-2xl gradient-border bg-gradient-to-br from-bg-elevated/50 to-bg-elevated/30 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />

      {/* 内容 */}
      <div className="relative flex flex-col items-center justify-center py-20 text-center">
        <div className="relative mb-6">
          {/* 图标背景光晕 */}
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />

          {/* 图标容器 */}
          <div className="relative w-20 h-20 rounded-full gradient-bg flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          {type === 'active' ? t('empty.active') : t('empty.expired')}
        </h3>
        <p className="text-sm text-text-muted max-w-md">
          {type === 'active' ? t('empty.activeDesc') : t('empty.expiredDesc')}
        </p>
      </div>
    </div>
  );
}
