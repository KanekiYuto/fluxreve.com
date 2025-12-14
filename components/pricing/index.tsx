'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import useUserStore from '@/store/useUserStore';
import useModalStore from '@/store/useModalStore';
import { getPricingTiersByPlan, type BillingCycle } from '@/config/pricing';
import { useCurrentSubscription, getSubscriptionStatus, getQuotaAmount } from './hooks';
import { BillingCycleToggle, PricingCard, renderCTAButton } from './components';
import type { TierTranslation } from './types';

interface PricingProps {
  /** 是否使用 h1 标签作为标题（默认为 h2） */
  useH1?: boolean;
}

export default function Pricing({ useH1 = false }: PricingProps) {
  const t = useTranslations('pricing');
  const { user } = useUserStore();
  const { openLoginModal } = useModalStore();
  const [isYearly, setIsYearly] = useState(false);

  const tierTranslations = t.raw('tiers') as TierTranslation[];
  const billingCycle: BillingCycle = isYearly ? 'yearly' : 'monthly';

  const { currentSubscription, isLoading, fetchCurrentSubscription } = useCurrentSubscription(user);

  // 根据参数动态选择标题标签
  const TitleTag = useH1 ? 'h1' : 'h2';

  // 分离付费计划和免费计划
  const paidPlans = ['trial', 'basic', 'pro'];
  const freePlans = ['free'];

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
          <TitleTag className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white px-4">
            {t('title')}
          </TitleTag>
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

        {/* 付费定价卡片网格 - 体验版仅在无订阅时显示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-12 sm:mb-16">
          {paidPlans.map((planType, index) => {
            // 如果有订阅，隐藏体验版卡片
            if (planType === 'trial' && currentSubscription) {
              return null;
            }

            const allPricings = getPricingTiersByPlan(planType as any);
            // Trial 只有 monthly，年付时也使用 monthly
            const currentTier = planType === 'trial'
              ? allPricings.find(t => t.billingCycle === 'monthly')
              : allPricings.find(t => t.billingCycle === billingCycle);
            const translation = tierTranslations[index];

            if (!currentTier) return null;

            const status = getSubscriptionStatus(currentTier, planType as any, currentSubscription);
            const quota = getQuotaAmount(planType as any, currentTier);

            return (
              <PricingCard
                key={`${planType}-${billingCycle}`}
                planType={planType as any}
                tier={currentTier}
                translation={translation}
                quota={quota}
                status={status}
                isYearly={isYearly}
                t={t}
                renderCTAButton={() => renderCTAButton(status, currentTier, translation, t, user, fetchCurrentSubscription, isLoading, openLoginModal)}
              />
            );
          })}
        </div>

        {/* 免费版卡片 - 横向响应式布局 - 仅在无订阅时显示 */}
        {!currentSubscription && (
          <div className="w-full max-w-7xl mx-auto">
            {freePlans.map((planType, index) => {
              const allPricings = getPricingTiersByPlan(planType as any);
              const currentTier = allPricings.find(t => t.billingCycle === billingCycle);
              const translationIndex = paidPlans.length + index;
              const translation = tierTranslations[translationIndex];

              if (!currentTier) return null;

              const status = getSubscriptionStatus(currentTier, planType as any, currentSubscription);
              const quota = getQuotaAmount(planType as any, currentTier);

              return (
                <PricingCard
                  key={`${planType}-${billingCycle}`}
                  planType={planType as any}
                  tier={currentTier}
                  translation={translation}
                  quota={quota}
                  status={status}
                  isYearly={isYearly}
                  t={t}
                  isHorizontal={true}
                  renderCTAButton={() => renderCTAButton(status, currentTier, translation, t, user, fetchCurrentSubscription, isLoading, openLoginModal)}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
