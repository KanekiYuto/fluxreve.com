'use client';

import { useTranslations } from 'next-intl';

interface QuotaSummaryCardProps {
  totalAvailable: number | null;
  activeQuotasCount: number;
}

export default function QuotaSummaryCard({ totalAvailable, activeQuotasCount }: QuotaSummaryCardProps) {
  const t = useTranslations('quota');

  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent gradient-border-colorful rounded-3xl p-8 mb-6 overflow-hidden group transition-all duration-300">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-primary/10 transition-all duration-500" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
            <div className="relative p-5 rounded-2xl gradient-bg">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-2 font-medium">{t('summary.title')}</p>
            {totalAvailable === null ? (
              // 骨架屏
              <div className="flex items-baseline gap-3">
                <div className="h-14 w-32 bg-bg-hover/50 rounded-lg animate-pulse" />
                <div className="h-7 w-16 bg-bg-hover/50 rounded animate-pulse" />
              </div>
            ) : (
              <div className="flex items-baseline gap-3">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {totalAvailable.toLocaleString()}
                </h2>
                <span className="text-lg text-primary font-semibold">{t('summary.credits')}</span>
              </div>
            )}
          </div>
        </div>

        {/* 右侧装饰 */}
        <div className="hidden md:flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold text-success">{t('status.active')}</span>
          </div>
          <p className="text-xs text-text-dim">
            {activeQuotasCount} {t('tabs.active')}
          </p>
        </div>
      </div>
    </div>
  );
}
