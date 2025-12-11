'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AIGenerator from '@/components/ai-generator/AIGenerator';

export default function AIGeneratorPage() {
  const t = useTranslations('ai-generator.page');
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [defaultTab, setDefaultTab] = useState('text-to-image');
  const [defaultModel, setDefaultModel] = useState<string | undefined>(undefined);
  const [defaultParameters, setDefaultParameters] = useState<any>(undefined);
  const [loading, setLoading] = useState(!!id);

  // 如果有 id 参数，从数据库获取任务信息
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchTaskInfo = async () => {
      try {
        const response = await fetch(`/api/ai-generator/share/${id}`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data;

          // 根据 taskType 确定 tab
          if (data.task_type === 'image-to-image') {
            setDefaultTab('image-to-image');
          } else {
            setDefaultTab('text-to-image');
          }

          // 设置模型
          if (data.model) {
            setDefaultModel(data.model);
          }

          // 设置参数
          if (data.parameters) {
            setDefaultParameters(data.parameters);
          }
        }
      } catch (error) {
        console.error('Failed to fetch task info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskInfo();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          {/* 加载动画 - SVG spinner */}
          <svg className="w-12 h-12 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-text-muted">{t('loading')}</p>
        </div>
      </div>
    );
  }

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
        <AIGenerator defaultTab={defaultTab} defaultModel={defaultModel} defaultParameters={defaultParameters} />
      </div>
    </div>
  );
}
