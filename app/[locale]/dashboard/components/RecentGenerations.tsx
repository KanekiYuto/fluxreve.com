'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getModelDisplayName } from '@/config/model-names';

// 任务接口定义
interface GenerationTask {
  taskId: string;
  taskType: string;
  provider: string;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  parameters: {
    prompt: string;
    aspect_ratio?: string;
    resolution?: string;
    seed?: string;
  };
  results?: Array<{
    url: string;
    type: string;
  }>;
  createdAt: string;
  completedAt?: string;
}

export default function RecentGenerations() {
  const t = useTranslations('dashboard.recent');
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取最近一周的生成任务
  useEffect(() => {
    const fetchRecentTasks = async () => {
      try {
        const response = await fetch('/api/ai-generator/tasks/recent');
        const data = await response.json();

        if (data.success) {
          setTasks(data.data || []);
        } else {
          setError(data.error || 'Failed to fetch tasks');
        }
      } catch (err) {
        console.error('Failed to fetch recent tasks:', err);
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTasks();
  }, []);

  const hasGenerations = tasks.length > 0;

  return (
    <div className="rounded-xl gradient-border p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="text-lg sm:text-xl font-bold text-white">{t('title')}</div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">{t('subtitle')}</p>
        </div>
        <button className="text-sm gradient-text hover:opacity-80 transition-opacity cursor-pointer font-semibold self-start sm:self-auto">
          {t('viewAll')} →
        </button>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12 sm:py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-text-muted">{t('loading')}</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="text-center py-12 sm:py-16">
          <p className="text-sm sm:text-base text-red-400">{error}</p>
        </div>
      )}

      {/* 空状态 */}
      {!loading && !error && !hasGenerations && (
        <div className="text-center py-12 sm:py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="text-base sm:text-lg font-semibold text-white mb-2">{t('empty.title')}</div>
          <p className="text-sm sm:text-base text-text-muted mb-6">{t('empty.subtitle')}</p>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg gradient-bg text-white text-sm sm:text-base font-semibold transition-all hover:scale-105 cursor-pointer">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{t('empty.cta')}</span>
          </button>
        </div>
      )}

      {/* 图片网格 - 当有数据时显示 */}
      {!loading && !error && hasGenerations && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tasks.map((task) => (
            <Link key={task.taskId} href={`/task/${task.taskId}`} className="cursor-pointer">
              {/* 图片容器 */}
              <div className="group">
                <div
                  className="relative rounded-lg p-[2px] mb-2"
                  style={{
                    background: 'linear-gradient(144deg, rgba(39, 39, 42, 0.5), rgba(39, 39, 42, 0.5))'
                  }}
                >
                  {/* 悬停时的渐变边框 */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(144deg, #FF3466, #C721FF)'
                    }}
                  />

                  {/* 内容容器 */}
                  <div className="relative rounded-lg overflow-hidden bg-bg-elevated">
                    {/* 只显示已完成的图片 */}
                    {task.results && task.results.length > 0 && (
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={task.results[0].url}
                          alt={task.parameters.prompt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 模型信息 */}
              <div>
                <span className="inline-flex items-center rounded border font-semibold transition-colors border-transparent px-1.5 py-0.5 text-xs bg-surface-secondary text-white tracking-wide hover:bg-bg-hover">
                  {getModelDisplayName(task.model)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
