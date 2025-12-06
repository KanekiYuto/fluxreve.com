'use client';

import { useTranslations } from 'next-intl';

export default function TasksHeader() {
  const t = useTranslations('tasks');

  return (
    <header className="bg-bg-elevated border-b border-border">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {t('header.title')}
        </h1>
        <p className="text-text-muted text-sm sm:text-base">
          {t('header.subtitle')}
        </p>
      </div>
    </header>
  );
}

