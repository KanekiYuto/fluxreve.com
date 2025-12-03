'use client';

import { useTranslations } from 'next-intl';

interface QuotaItem {
  id: string;
  type: string;
  amount: number;
  consumed: number;
  available: number;
  issuedAt: Date;
  expiresAt: Date | null;
}

interface QuotaCardProps {
  quota: QuotaItem;
}

export default function QuotaCard({ quota }: QuotaCardProps) {
  const t = useTranslations('quota');

  const percentage = quota.amount > 0 ? (quota.consumed / quota.amount) * 100 : 0;

  const formatDate = (date: Date | null) => {
    if (!date) return t('table.noExpiry');
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  return (
    <div className="group bg-gradient-to-br from-bg-elevated to-bg-elevated/50 gradient-border rounded-2xl p-6 transition-all duration-300 cursor-pointer">
      {/* 配额类型和状态 */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">
            {t(`quotaTypes.${quota.type}`)}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(quota.issuedAt)}</span>
            <span className="text-text-dim">→</span>
            <span>{formatDate(quota.expiresAt)}</span>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
            quota.available > 0
              ? 'bg-success/15 text-success'
              : 'bg-text-dim/15 text-text-dim'
          }`}
        >
          {quota.available > 0 ? t('status.active') : t('status.depleted')}
        </div>
      </div>

      {/* 配额进度条 */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {formatAmount(quota.available)}
            </span>
            <span className="text-sm text-text-muted">
              / {formatAmount(quota.amount)}
            </span>
          </div>
          <span className="text-sm font-semibold text-text-muted">
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="relative w-full h-3 bg-bg-card rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
              percentage < 50
                ? 'bg-gradient-to-r from-success to-success/80'
                : percentage < 80
                  ? 'bg-gradient-to-r from-warning to-warning/80'
                  : 'bg-gradient-to-r from-error to-error/80'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* 使用统计 - 精简版 */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{t('stats.consumed')}:</span>
          <span className="text-sm font-bold text-white">{quota.consumed.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{t('stats.remaining')}:</span>
          <span className="text-sm font-bold text-success">{formatAmount(quota.available)}</span>
        </div>
      </div>
    </div>
  );
}
