'use client';

import { useEffect, useState } from 'react';
import SubscriptionTable from './components/SubscriptionTable';
import StatsCards from './components/StatsCards';
import AddSubscriptionModal from './components/AddSubscriptionModal';

interface SubscriptionData {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
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

interface SubscriptionStats {
  total: number;
  active: number;
  canceled: number;
  expired: number;
  monthlyRevenue: number;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    canceled: 0,
    expired: 0,
    monthlyRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 获取订阅列表和统计数据
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 记录开始时间
      const startTime = Date.now();
      const MIN_LOADING_TIME = 500; // 最小展示时间 500ms

      const response = await fetch('/api/admin/subscriptions');

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const result = await response.json();

      if (result.success) {
        setSubscriptions(result.data || []);
        setStats(result.stats || stats);
      } else {
        throw new Error(result.error || 'Unknown error');
      }

      // 确保骨架屏至少显示最小时间
      const elapsedTime = Date.now() - startTime;
      const remainingTime = MIN_LOADING_TIME - elapsedTime;

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-hover rounded-full" />
            <h1 className="text-4xl font-bold text-white tracking-tight">订阅管理</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-95 cursor-pointer flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加订阅
          </button>
        </div>
        <p className="text-text-muted text-base ml-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          查看和管理所有用户的订阅信息
        </p>
      </div>

      {/* 统计卡片 */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* 错误提示 */}
      {error && (
        <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-4 mb-6 shadow-sm shadow-red-500/10">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-red-400 text-sm font-semibold">错误</p>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 订阅列表 */}
      <SubscriptionTable
        subscriptions={subscriptions}
        isLoading={isLoading}
        onRefresh={fetchSubscriptions}
      />

      {/* 添加订阅 Modal */}
      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSubscriptions}
      />
    </div>
  );
}
