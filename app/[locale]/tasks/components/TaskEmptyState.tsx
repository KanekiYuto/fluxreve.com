'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

interface TaskEmptyStateProps {
  hasFilters: boolean;
}

export default function TaskEmptyState({ hasFilters }: TaskEmptyStateProps) {
  const t = useTranslations('tasks');

  return (
    <div className="text-center py-16 sm:py-24">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {hasFilters ? t('empty.filteredTitle') : t('empty.title')}
      </h3>
      <p className="text-text-muted mb-6 max-w-md mx-auto">
        {hasFilters ? t('empty.filteredSubtitle') : t('empty.subtitle')}
      </p>
      {!hasFilters && (
        <Link
          href="/ai-generator"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-bg text-white font-semibold transition-all hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{t('empty.cta')}</span>
        </Link>
      )}
    </div>
  );
}

