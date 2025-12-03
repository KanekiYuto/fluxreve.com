'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import useUserStore from '@/store/useUserStore';
import LoginRequired from '@/components/common/LoginRequired';
import SubscriptionSkeletonCards from './components/SubscriptionSkeletonCards';
import SubscriptionList from './components/SubscriptionList';
import EmptyState from './components/EmptyState';

interface SubscriptionRecord {
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
  createdAt: Date;
}

export default function SubscriptionPage() {
  const t = useTranslations('subscription');
  const { user } = useUserStore();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取订阅列表
  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    const startTime = Date.now();

    try {
      const response = await fetch('/api/subscription/list');
      const result = await response.json();

      if (result.success) {
        setSubscriptions(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      // 确保骨架屏至少显示 500ms
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 500 - elapsedTime);

      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    }
  };

  // 未登录状态
  if (!user) {
    return (
      <div className="min-h-screen">
        {/* 页面标题 */}
        <div className="bg-bg-elevated border-b border-border">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
            <p className="text-text-muted">{t('subtitle')}</p>
          </div>
        </div>

        {/* 登录提示 */}
        <LoginRequired
          title={t('login.title')}
          description={t('login.description')}
          icon={
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          }
        />
      </div>
    );
  }

  // 已登录状态
  return (
    <div className="min-h-screen space-y-6 pb-8">
      {/* 页面标题 */}
      <div className="bg-bg-elevated border-b border-border">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-text-muted">{t('subtitle')}</p>
        </div>
      </div>

      <div className="px-6">
        {isLoading ? (
          <SubscriptionSkeletonCards />
        ) : subscriptions.length > 0 ? (
          <SubscriptionList subscriptions={subscriptions} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
