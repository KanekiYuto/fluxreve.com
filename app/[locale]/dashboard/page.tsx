'use client';

import { useTranslations } from 'next-intl';
import useUserStore from '@/store/useUserStore';
import LoginRequired from '@/components/common/LoginRequired';
import DashboardHeader from './components/DashboardHeader';
import QuotaCard from './components/QuotaCard';
import StatCard from './components/StatCard';
// import QuickActions from './components/QuickActions';
import MarketingCard from './components/MarketingCard';
import RecentGenerations from './components/RecentGenerations';

export default function DashboardPage() {
  const { user, quota } = useUserStore();
  const t = useTranslations('dashboard.stats');
  const tCommon = useTranslations('dashboard');

  // 未登录状态 - 显示 DashboardHeader 和登录提示
  if (!user) {
    return (
      <div className="min-h-screen">
        <DashboardHeader isLoggedIn={false} />

        <LoginRequired
          title={tCommon('loginPrompt.title')}
          description={tCommon('loginPrompt.description')}
          buttonText={tCommon('loginPrompt.cta')}
          maxWidth="2xl"
          icon={
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
          features={[
            {
              icon: (
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: tCommon('loginPrompt.features.quota'),
              description: tCommon('loginPrompt.features.quotaDesc'),
              iconBgColor: 'bg-primary/10',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              title: tCommon('loginPrompt.features.projects'),
              description: tCommon('loginPrompt.features.projectsDesc'),
              iconBgColor: 'bg-secondary/10',
            },
            {
              icon: (
                <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: tCommon('loginPrompt.features.analytics'),
              description: tCommon('loginPrompt.features.analyticsDesc'),
              iconBgColor: 'bg-purple-500/10',
            },
          ]}
        />
      </div>
    );
  }

  const userType = user.userType;

  return (
    <div className="min-h-screen">
      <DashboardHeader userName={user.name} userType={userType} />

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 py-8">
        {/* 统计卡片和营销卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* 剩余配额 */}
          <QuotaCard userType={userType} quota={quota} />

          {/* 营销卡片 - 占据三个统计卡片的位置 */}
          <MarketingCard />

          {/* 总项目数 - 暂时隐藏 */}
          {/* <StatCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            }
            value={0}
            label={t('projects')}
            color="secondary"
          /> */}

          {/* 已上传图片数 - 暂时隐藏 */}
          {/* <StatCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            value={0}
            label={t('images')}
            color="blue"
          /> */}

          {/* 创建模板数 - 暂时隐藏 */}
          {/* <StatCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h4a1 1 0 010 2H6v2a1 1 0 01-2 0V5zm16 0a1 1 0 00-1-1h-4a1 1 0 100 2h2v2a1 1 0 102 0V5zM4 15a1 1 0 011 1v2h2a1 1 0 110 2H5a1 1 0 01-1-1v-4zm16 0a1 1 0 00-1 1v2h-2a1 1 0 100 2h4a1 1 0 001-1v-4z"
                />
              </svg>
            }
            value={0}
            label={t('templates')}
            color="purple"
          /> */}
        </div>

        {/* 快速操作 */}
        {/* <QuickActions /> */}

        {/* 最近生成 */}
        <RecentGenerations />
      </div>
    </div>
  );
}
