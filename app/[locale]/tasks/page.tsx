'use client';

import { useTranslations } from 'next-intl';
import useUserStore from '@/store/useUserStore';
import LoginRequired from '@/components/common/LoginRequired';
import TaskList from './components/TaskList';
import TasksHeader from './components/TasksHeader';

export default function TasksPage() {
  const { user } = useUserStore();
  const t = useTranslations('tasks');

  // 未登录状态 - 显示登录提示
  if (!user) {
    return (
      <div className="min-h-screen">
        <TasksHeader />
        <LoginRequired
          title={t('loginPrompt.title')}
          description={t('loginPrompt.description')}
          buttonText={t('loginPrompt.cta')}
          maxWidth="2xl"
          icon={
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TasksHeader />
      <div className="container mx-auto px-4 py-8">
        <TaskList />
      </div>
    </div>
  );
}
