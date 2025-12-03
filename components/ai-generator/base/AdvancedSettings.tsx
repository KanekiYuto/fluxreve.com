'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface AdvancedSettingsProps {
  children: ReactNode;
}

export default function AdvancedSettings({
  children,
}: AdvancedSettingsProps) {
  const t = useTranslations('ai-generator.form');
  return (
    <details className="group">
      <summary className="cursor-pointer text-sm font-semibold list-none flex items-center justify-between">
        <span>{t('advancedSettings')}</span>
        <svg
          className="w-5 h-5 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="mt-4 rounded-xl gradient-border">
        <div className="px-4 py-4 space-y-4">{children}</div>
      </div>
    </details>
  );
}
