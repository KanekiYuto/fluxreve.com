'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations('share.notFound');

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-lg">
        {/* 404 大号码 */}
        <div className="mb-12">
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 mb-2">
            404
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-primary to-purple-600 rounded-full" />
        </div>

        {/* 标题和描述 */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          {t('title')}
        </h2>
        <p className="text-text-muted text-base sm:text-lg mb-10 max-w-md mx-auto">
          {t('description')}
        </p>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/ai-generator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {t('createButton')}
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-secondary hover:bg-bg-hover text-white font-medium transition-colors border border-border/50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {t('homeButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}
