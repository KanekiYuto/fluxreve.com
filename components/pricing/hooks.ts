import { useState, useEffect, useCallback, useRef } from 'react';
import type { Subscription, SubscriptionStatus } from './types';
import type { PricingTier, PlanType } from '@/config/pricing';
import { quotaConfig } from '@/lib/quota/config';
import { SUBSCRIPTION_QUOTA_CONFIG } from '@/config/subscription';

// 获取用户当前订阅
export function useCurrentSubscription(user: any) {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 如果没有用户，直接设置为非加载状态
    if (!user) {
      setIsLoading(false);
      setCurrentSubscription(null);
      hasInitialized.current = true;
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const response = await fetch('/api/subscription/current');
        const result = await response.json();
        if (!cancelled) {
          if (result.success && result.data) {
            setCurrentSubscription(result.data);
          } else {
            setCurrentSubscription(null);
          }
          setIsLoading(false);
          hasInitialized.current = true;
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch subscription:', error);
          setCurrentSubscription(null);
          setIsLoading(false);
          hasInitialized.current = true;
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // 手动刷新订阅信息的函数
  const fetchCurrentSubscription = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/current');
      const result = await response.json();
      if (result.success && result.data) {
        setCurrentSubscription(result.data);
      } else {
        setCurrentSubscription(null);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setCurrentSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return { currentSubscription, isLoading, fetchCurrentSubscription };
}

// 获取订阅状态
export function getSubscriptionStatus(
  tier: PricingTier,
  planType: PlanType,
  currentSubscription: Subscription | null
): SubscriptionStatus {
  const productId = tier.creemPayProductId;

  // 免费方案：始终为"当前"状态
  if (planType === 'free') {
    return 'current';
  }

  // 产品未配置
  if (!productId) return 'configuring';

  // 无活跃订阅 - 显示"立即订阅"
  if (!currentSubscription || currentSubscription.status !== 'active') return 'new';

  // 当前订阅 - 显示"当前订阅"
  if (currentSubscription.planType === tier.subscriptionPlanType) return 'current';

  // 其他所有情况 - 显示"立即订阅"
  return 'new';
}

// 获取配额数量
export function getQuotaAmount(planType: PlanType, tier: PricingTier): number {
  if (planType === 'free') return quotaConfig.dailyFreeQuota;
  if (tier.subscriptionPlanType) {
    return SUBSCRIPTION_QUOTA_CONFIG[tier.subscriptionPlanType] || 0;
  }
  return 0;
}
