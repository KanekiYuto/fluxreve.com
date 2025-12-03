'use client';

import { useTranslations } from 'next-intl';

interface CreditsCardProps {
  /**
   * 积分数量
   */
  credits: number | null;
  /**
   * 是否正在加载
   */
  isLoading?: boolean;
  /**
   * 刷新回调
   */
  onRefresh?: () => void;
}

export default function CreditsCard({
  credits,
  isLoading = false,
  onRefresh,
}: CreditsCardProps) {
  const t = useTranslations('ai-generator.credits');
  return (
    <div className="rounded-lg border border-border bg-card/50 p-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-foreground"
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
          <span className="text-base font-semibold text-foreground">
            {credits !== null ? credits.toLocaleString() : '***'}
          </span>
          <span className="text-sm text-gray-400">{t('quota')}</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('refresh')}
          aria-label={t('refresh')}
        >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
        </button>
      </div>
    </div>
  );
}
