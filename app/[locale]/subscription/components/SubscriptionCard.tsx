'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import ManageSubscriptionButton from '@/components/subscription/ManageSubscriptionButton';

interface SubscriptionCardProps {
  subscription: {
    id: string;
    paymentPlatform: string;
    paymentSubscriptionId: string;
    paymentCustomerId: string | null;
    planType: string;
    nextPlanType: string | null;
    status: string;
    amount: number;
    currency: string;
    startedAt: Date;
    expiresAt: Date | null;
    nextBillingAt: Date | null;
    canceledAt: Date | null;
  };
}

/**
 * 订阅卡片组件
 */
export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const t = useTranslations('subscription.card');

  // 格式化日期
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return format(new Date(date), 'yyyy-MM-dd');
  };

  // 格式化金额
  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  };

  // 获取状态信息
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      active: { text: t('status.active'), className: 'bg-green-500/10 text-green-500' },
      canceled: { text: t('status.canceled'), className: 'bg-gray-500/10 text-gray-500' },
      expired: { text: t('status.expired'), className: 'bg-red-500/10 text-red-500' },
      paused: { text: t('status.paused'), className: 'bg-yellow-500/10 text-yellow-500' },
      pending: { text: t('status.pending'), className: 'bg-blue-500/10 text-blue-500' },
    };
    return statusMap[status] || { text: status, className: 'bg-gray-500/10 text-gray-500' };
  };

  // 获取计划类型文本
  const getPlanTypeText = (planType: string) => {
    const planMap: Record<string, string> = {
      monthly_hobby: t('planTypes.monthly_hobby'),
      yearly_hobby: t('planTypes.yearly_hobby'),
      monthly_basic: t('planTypes.monthly_basic'),
      yearly_basic: t('planTypes.yearly_basic'),
      monthly_pro: t('planTypes.monthly_pro'),
      yearly_pro: t('planTypes.yearly_pro'),
    };
    return planMap[planType] || planType;
  };

  return (
    <div className="bg-bg-elevated rounded-2xl p-4 sm:p-6 border border-border">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="text-xl font-bold text-white">{getPlanTypeText(subscription.planType)}</div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
              getStatusInfo(subscription.status).className
            }`}
          >
            {getStatusInfo(subscription.status).text}
          </span>
        </div>
        {/* 显示计划变更信息 - 仅在订阅激活时显示 */}
        {subscription.status === 'active' && subscription.nextPlanType && subscription.nextPlanType !== subscription.planType && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3466]/15 to-[#C721FF]/15 border border-white/30 backdrop-blur-sm">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-white/80 font-medium">{t('nextRenewal')}</span>
              <span className="text-sm font-bold gradient-text">{getPlanTypeText(subscription.nextPlanType)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 订阅金额 */}
        <div>
          <p className="text-sm text-text-muted mb-1">{t('amount')}</p>
          <p className="text-lg font-semibold text-white">
            {formatAmount(subscription.amount, subscription.currency)}
          </p>
        </div>

        {/* 支付平台 */}
        <div>
          <p className="text-sm text-text-muted mb-1">{t('platform')}</p>
          <p className="text-lg font-semibold text-white capitalize">{subscription.paymentPlatform}</p>
        </div>

        {/* 开始日期 */}
        <div>
          <p className="text-sm text-text-muted mb-1">{t('startDate')}</p>
          <p className="text-lg font-semibold text-white">{formatDate(subscription.startedAt)}</p>
        </div>

        {/* 到期日期 */}
        <div>
          <p className="text-sm text-text-muted mb-1">{t('expiryDate')}</p>
          <p className="text-lg font-semibold text-white">{formatDate(subscription.expiresAt)}</p>
        </div>

        {/* 下次续费日期 */}
        {subscription.nextBillingAt && subscription.status === 'active' && (
          <div>
            <p className="text-sm text-text-muted mb-1">{t('nextBillingDate')}</p>
            <p className="text-lg font-semibold text-white">{formatDate(subscription.nextBillingAt)}</p>
          </div>
        )}

        {/* 取消日期 */}
        {subscription.canceledAt && (
          <div>
            <p className="text-sm text-text-muted mb-1">{t('canceledDate')}</p>
            <p className="text-lg font-semibold text-white">{formatDate(subscription.canceledAt)}</p>
          </div>
        )}
      </div>

      {/* 管理订阅按钮 */}
      {subscription.paymentCustomerId && subscription.status === 'active' && (
        <div className="mt-6 pt-6 border-t border-border">
          <ManageSubscriptionButton customerId={subscription.paymentCustomerId} />
        </div>
      )}
    </div>
  );
}
