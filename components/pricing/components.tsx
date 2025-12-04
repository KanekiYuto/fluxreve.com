import { CreemCheckout } from '@creem_io/nextjs';
import { getPricingTiersByPlan, type PlanType, type PricingTier } from '@/config/pricing';
import UpgradeSubscriptionButton from '@/components/subscription/UpgradeSubscriptionButton';
import type { SubscriptionStatus, TierTranslation } from './types';

// 计费周期切换组件
export function BillingCycleToggle({
  isYearly,
  onToggle,
  t
}: {
  isYearly: boolean;
  onToggle: (value: boolean) => void;
  t: any;
}) {
  return (
    <div className="inline-flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-bg-elevated/80 backdrop-blur-sm gradient-border">
      <button
        onClick={() => onToggle(false)}
        className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 cursor-pointer ${
          !isYearly
            ? 'gradient-bg text-white scale-105'
            : 'text-text-muted hover:text-text hover:bg-bg-hover/50'
        }`}
      >
        {t('billing.monthly')}
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 relative cursor-pointer ${
          isYearly
            ? 'gradient-bg text-white scale-105'
            : 'text-text-muted hover:text-text hover:bg-bg-hover/50'
        }`}
      >
        {t('billing.yearly')}
        <span className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-full">
          {t('billing.discount')}
        </span>
      </button>
    </div>
  );
}

// 定价卡片组件
export function PricingCard({
  planType,
  tier,
  translation,
  quota,
  isYearly,
  t,
  renderCTAButton,
}: {
  planType: PlanType;
  tier: PricingTier;
  translation: TierTranslation;
  quota: number;
  status: SubscriptionStatus;
  isYearly: boolean;
  t: any;
  renderCTAButton: () => React.ReactNode;
}) {
  // 计算年付节省金额
  const allPricings = getPricingTiersByPlan(planType);
  const monthlyTier = allPricings.find(t => t.billingCycle === 'monthly');
  const yearlyTier = allPricings.find(t => t.billingCycle === 'yearly');
  const originalYearlyPrice = monthlyTier ? monthlyTier.price * 12 : 0;
  const yearlySavings = yearlyTier ? originalYearlyPrice - yearlyTier.price : 0;

  return (
    <div
      className={`group relative rounded-2xl sm:rounded-3xl transition-all duration-500 hover:translate-y-[-4px] sm:hover:translate-y-[-8px] ${
        tier.highlighted
          ? 'gradient-border-colorful bg-gradient-to-br from-primary/10 via-bg-elevated to-bg-elevated md:scale-105 z-10'
          : 'gradient-border bg-gradient-to-br from-bg-elevated to-bg-card'
      }`}
    >
      {/* 推荐标签 */}
      {tier.highlighted && (
        <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-1.5 sm:py-2 gradient-bg text-white text-xs sm:text-sm font-bold rounded-full whitespace-nowrap">
          ✨ {t('recommended')}
        </div>
      )}

      {/* 装饰性背景 */}
      <div className="hidden sm:block absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <div className="relative p-6 sm:p-8">
        {/* 方案名称 */}
        <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{translation.name}</h3>
        <p className="text-sm sm:text-base text-text-muted mb-4 sm:mb-6 leading-relaxed">
          {translation.description}
        </p>

        {/* 价格 */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">${tier.price}</span>
            <span className="text-sm sm:text-base text-text-muted">
              /{isYearly ? t('billing.year') : t('billing.month')}
            </span>
            {isYearly && yearlySavings > 0 && (
              <SavingsBadge amount={yearlySavings} t={t} />
            )}
          </div>
        </div>

        {/* CTA 按钮 */}
        {renderCTAButton()}

        {/* 功能列表 */}
        <FeatureList
          features={translation.features}
          unsupportedFeatures={translation.unsupportedFeatures}
          quota={quota}
        />
      </div>
    </div>
  );
}

// 节省金额徽章
export function SavingsBadge({ amount, t }: { amount: number; t: any }) {
  return (
    <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30 sm:border-2 sm:border-secondary/40">
      <CheckIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary" />
      <span className="text-[10px] sm:text-xs font-semibold text-secondary whitespace-nowrap">
        {t('billing.save', { amount })}
      </span>
    </div>
  );
}

// 功能列表组件
export function FeatureList({
  features,
  unsupportedFeatures,
  quota,
}: {
  features: string[];
  unsupportedFeatures?: string[];
  quota: number;
}) {
  const formattedQuota = quota.toLocaleString();

  return (
    <ul className="space-y-3 sm:space-y-4">
      {/* 支持的功能 */}
      {features.map((feature, index) => (
        <li key={`supported-${index}`} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
          <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
          <span className="text-text-muted leading-relaxed">
            {feature.replace('{quota}', formattedQuota)}
          </span>
        </li>
      ))}

      {/* 不支持的功能 */}
      {unsupportedFeatures?.map((feature, index) => (
        <li key={`unsupported-${index}`} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm opacity-40">
          <XIcon className="w-4 h-4 sm:w-5 sm:h-5 text-text-dim flex-shrink-0 mt-0.5" />
          <span className="text-text-dim leading-relaxed line-through">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

// 渲染 CTA 按钮
export function renderCTAButton(
  status: SubscriptionStatus,
  tier: PricingTier,
  translation: TierTranslation,
  t: any,
  user: any,
  fetchCurrentSubscription: () => void,
  isLoading: boolean = false
): React.ReactNode {
  const baseClassName = "group/btn w-full h-11 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 mb-6 sm:mb-8 relative overflow-hidden";
  const activeClassName = tier.highlighted
    ? 'gradient-bg text-white hover:scale-[1.02] active:scale-95'
    : 'gradient-border text-text hover:text-white hover:gradient-bg active:scale-95';

  // 如果正在加载订阅信息，显示加载状态
  if (isLoading) {
    return (
      <button disabled className={`${baseClassName} cursor-not-allowed opacity-50 gradient-border text-text`}>
        <span className="relative z-10 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {t('status.loading')}
        </span>
      </button>
    );
  }

  // 免费方案或未配置
  if (status === 'free' || status === 'configuring') {
    return (
      <button disabled className={`${baseClassName} cursor-not-allowed opacity-50 gradient-border text-text`}>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {status === 'free' ? translation.cta : t('status.configuring')}
        </span>
      </button>
    );
  }

  // 当前订阅
  if (status === 'current') {
    return (
      <button disabled className={`${baseClassName} cursor-not-allowed gradient-bg text-white opacity-70`}>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {t('status.current')}
          <CheckIcon />
        </span>
      </button>
    );
  }

  // 下期生效
  if (status === 'scheduled') {
    return (
      <button disabled className={`${baseClassName} cursor-not-allowed gradient-border text-primary opacity-70`}>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {t('status.scheduled')}
          <ClockIcon />
        </span>
      </button>
    );
  }

  const buttonText = status === 'upgrade'
    ? t('status.upgrade')
    : status === 'downgrade'
    ? t('status.downgrade')
    : translation.cta;

  // 升级或降级
  if (status === 'upgrade' || status === 'downgrade') {
    return (
      <UpgradeSubscriptionButton
        productId={tier.creemPayProductId!}
        className={`${baseClassName} cursor-pointer ${activeClassName}`}
        onSuccess={fetchCurrentSubscription}
        onError={(error) => console.error('Subscription change error:', error)}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {buttonText}
          <ArrowIcon />
        </span>
      </UpgradeSubscriptionButton>
    );
  }

  // 新订阅
  return (
    <CreemCheckout
      productId={tier.creemPayProductId!}
      referenceId={user?.id}
      customer={user ? { email: user.email, name: user.name } : undefined}
      metadata={{}}
    >
      <button className={`${baseClassName} cursor-pointer ${activeClassName}`}>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {buttonText}
          <ArrowIcon />
        </span>
      </button>
    </CreemCheckout>
  );
}

// 图标组件
export function CheckIcon({ className = "w-4 h-4 sm:w-5 sm:h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

export function XIcon({ className = "w-4 h-4 sm:w-5 sm:h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );
}

export function ClockIcon({ className = "w-4 h-4 sm:w-5 sm:h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );
}

export function ArrowIcon({ className = "w-4 h-4 sm:w-5 sm:h-5" }: { className?: string }) {
  return (
    <svg className={`${className} group-hover/btn:translate-x-1 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}
