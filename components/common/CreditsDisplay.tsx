'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import useUserStore from '@/store/useUserStore';

interface CreditsDisplayProps {
  /**
   * 是否显示刷新按钮
   */
  showRefresh?: boolean;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 紧凑模式（更小的尺寸）
   */
  compact?: boolean;
}

/**
 * 公共积分显示组件
 * 使用 store 统一管理积分状态
 */
export default function CreditsDisplay({
  showRefresh = true,
  className = '',
  compact = false,
}: CreditsDisplayProps) {
  const t = useTranslations('ai-generator.credits');
  const { quota, isQuotaLoading, fetchQuota } = useUserStore();

  // 组件挂载时自动加载积分（如果还没有加载）
  useEffect(() => {
    if (quota === null && !isQuotaLoading) {
      fetchQuota();
    }
  }, [quota, isQuotaLoading, fetchQuota]);

  // 格式化积分显示
  const formatCredits = () => {
    if (quota === null) return '***';
    return quota.toLocaleString();
  };

  return (
    <div
      className={`rounded-lg border border-border bg-card/50 ${
        compact ? 'p-1.5' : 'p-2'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* 积分图标 */}
          <svg
            className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-foreground`}
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

          {/* 积分数量 */}
          <span
            className={`${
              compact ? 'text-sm' : 'text-base'
            } font-semibold text-foreground`}
          >
            {formatCredits()}
          </span>

          {/* 积分文本 */}
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-400`}>
            {t('quota')}
          </span>
        </div>

        {/* 刷新按钮 */}
        {showRefresh && (
          <button
            onClick={fetchQuota}
            disabled={isQuotaLoading}
            className={`${
              compact ? 'p-1' : 'p-1.5'
            } rounded-md hover:bg-zinc-700/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            title={t('refresh')}
            aria-label={t('refresh')}
          >
            <svg
              className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${
                isQuotaLoading ? 'animate-spin' : ''
              }`}
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
        )}
      </div>
    </div>
  );
}
