'use client';

import { useTranslations } from 'next-intl';
import AIGenerator from '@/components/ai-generator/AIGenerator';

export default function AIGeneratorPage() {
  const t = useTranslations('ai-generator.page');

  return (
    <div className="min-h-screen">
      {/* 页面标题 */}
      <div className="bg-bg-elevated border-b border-border">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-text-muted">{t('description')}</p>
        </div>
      </div>

      {/* AI 生成器组件 */}
      <div className="py-6">
        <AIGenerator defaultTab="text-to-image" />
      </div>
    </div>
  );
}
