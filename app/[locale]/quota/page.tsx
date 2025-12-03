'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import useUserStore from '@/store/useUserStore';
import LoginRequired from '@/components/common/LoginRequired';
import QuotaSummaryCard from './components/QuotaSummaryCard';
import QuotaTabSwitch from './components/QuotaTabSwitch';
import QuotaSkeletonCards from './components/QuotaSkeletonCards';
import QuotaList from './components/QuotaList';

interface QuotaItem {
  id: string;
  type: string;
  amount: number;
  consumed: number;
  available: number;
  issuedAt: Date;
  expiresAt: Date | null;
}

export default function QuotaPage() {
  const t = useTranslations('quota');
  const { user } = useUserStore();
  const [totalAvailable, setTotalAvailable] = useState<number | null>(null);
  const [activeQuotas, setActiveQuotas] = useState<QuotaItem[] | null>(null);
  const [expiredQuotas, setExpiredQuotas] = useState<QuotaItem[] | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

  // 使用 useCallback 定义获取函数，避免函数声明顺序问题
  const fetchTotalQuota = useCallback(async () => {
    try {
      const response = await fetch('/api/quota/total');
      const result = await response.json();

      if (result.success) {
        setTotalAvailable(result.data.totalAvailable);
      }
    } catch (error) {
      console.error('Failed to fetch total quota:', error);
    }
  }, []);

  const fetchActiveQuotas = useCallback(async () => {
    try {
      const response = await fetch('/api/quota/list?type=active');
      const result = await response.json();

      if (result.success) {
        setActiveQuotas(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch active quotas:', error);
      setActiveQuotas([]);
    }
  }, []);

  const fetchExpiredQuotas = useCallback(async () => {
    try {
      const response = await fetch('/api/quota/list?type=expired');
      const result = await response.json();

      if (result.success) {
        setExpiredQuotas(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch expired quotas:', error);
      setExpiredQuotas([]);
    }
  }, []);

  // 获取总配额（仅在已登录时）
  useEffect(() => {
    if (user) {
      // 初始数据获取，不会导致级联渲染
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTotalQuota();
    }
  }, [user, fetchTotalQuota]);

  // 根据当前标签页加载对应数据（仅在已登录时）
  useEffect(() => {
    if (!user) return;

    if (activeTab === 'active' && activeQuotas === null) {
      // 按需数据获取，不会导致级联渲染
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchActiveQuotas();
    } else if (activeTab === 'expired' && expiredQuotas === null) {
      // 按需数据获取，不会导致级联渲染
      fetchExpiredQuotas();
    }
  }, [activeTab, activeQuotas, expiredQuotas, user, fetchActiveQuotas, fetchExpiredQuotas]);

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
          title={t('loginRequired.title')}
          description={t('loginRequired.description')}
          icon={
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
        />
      </div>
    );
  }

  // 已登录状态
  return (
    <div className="space-y-6 pb-8">
      {/* 页面标题 */}
      <div className="bg-bg-elevated border-b border-border">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-text-muted">{t('subtitle')}</p>
        </div>
      </div>

      <div className="px-6">
        {/* 总配额卡片 */}
        <QuotaSummaryCard
          totalAvailable={totalAvailable}
          activeQuotasCount={activeQuotas?.length || 0}
        />

        {/* 标签页切换 */}
        <QuotaTabSwitch
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeQuotasCount={activeQuotas?.length || 0}
          expiredQuotasCount={expiredQuotas?.length || 0}
        />

        {/* 配额列表 */}
        <div className="relative">
          <div
            className={`transition-all duration-300 ${
              activeTab === 'active'
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-4 absolute inset-0 pointer-events-none'
            }`}
          >
            {activeQuotas === null ? (
              <QuotaSkeletonCards />
            ) : (
              <QuotaList quotas={activeQuotas} type="active" />
            )}
          </div>
          <div
            className={`transition-all duration-300 ${
              activeTab === 'expired'
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'
            }`}
          >
            {expiredQuotas === null ? (
              <QuotaSkeletonCards />
            ) : (
              <QuotaList quotas={expiredQuotas} type="expired" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
