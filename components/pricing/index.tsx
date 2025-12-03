'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import useUserStore from '@/store/useUserStore';
import { getUniquePlanTypes, getPricingTiersByPlan, type BillingCycle } from '@/config/pricing';
import { useCurrentSubscription, getSubscriptionStatus, getQuotaAmount } from './hooks';
import { BillingCycleToggle, PricingCard, renderCTAButton } from './components';
import type { TierTranslation } from './types';

export default function Pricing() {
  const t = useTranslations('pricing');
  const { user } = useUserStore();
  const [isYearly, setIsYearly] = useState(false);

  const tierTranslations = t.raw('tiers') as TierTranslation[];
  const billingCycle: BillingCycle = isYearly ? 'yearly' : 'monthly';
  const uniquePlanTypes = useMemo(() => getUniquePlanTypes(), []);

  const { currentSubscription, isLoading, fetchCurrentSubscription } = useCurrentSubscription(user);

  return (
    <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs sm:text-sm font-semibold text-primary">{t('badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white px-4">
            {t('title')}
          </h2>
          <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
            {t('subtitle')}
          </p>

          {/* 订阅周期切换 */}
          <BillingCycleToggle
            isYearly={isYearly}
            onToggle={setIsYearly}
            t={t}
          />
        </div>

        {/* 定价卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {uniquePlanTypes.map((planType, index) => {
            const allPricings = getPricingTiersByPlan(planType);
            const currentTier = allPricings.find(t => t.billingCycle === billingCycle);
            const translation = tierTranslations[index];

            if (!currentTier) return null;

            const status = getSubscriptionStatus(currentTier, planType, currentSubscription);
            const quota = getQuotaAmount(planType, currentTier);

            return (
              <PricingCard
                key={`${planType}-${billingCycle}`}
                planType={planType}
                tier={currentTier}
                translation={translation}
                quota={quota}
                status={status}
                isYearly={isYearly}
                t={t}
                renderCTAButton={() => renderCTAButton(status, currentTier, translation, t, user, fetchCurrentSubscription, isLoading)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
