'use client';

import { useTranslations } from 'next-intl';

interface ProcessingViewProps {
  status: 'pending' | 'processing' | 'failed';
}

export default function ProcessingView({ status }: ProcessingViewProps) {
  const t = useTranslations('task.processing');

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-lg">
        {/* 加载动画 */}
        <div className="mb-12 flex flex-col items-center">
          {/* 简洁的加载器 */}
          <div className="relative w-16 h-16 mb-8">
            {/* 旋转的圆环 */}
            <svg className="animate-spin w-16 h-16" viewBox="0 0 50 50">
              <circle
                className="stroke-surface-secondary"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4"
              />
              <circle
                className="stroke-primary"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4"
                strokeDasharray="80 60"
                strokeLinecap="round"
              />
            </svg>

            {/* 中心闪电图标 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
              </svg>
            </div>
          </div>

          {/* 进度点 */}
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>

        {/* 标题和描述 */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          {status === 'failed' ? t('failedTitle') : t('title')}
        </h1>
        <p className="text-text-muted text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
          {status === 'failed' ? t('failedDescription') : t('description')}
        </p>

        {/* 提示卡片 */}
        {status !== 'failed' && (
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-surface-secondary border border-border/50 text-sm">
            <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-text-muted">{t('tip')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
