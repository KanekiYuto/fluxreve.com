'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

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
    <div className="rounded-xl gradient-border p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">{t('title')}</h2>
          <p className="text-sm text-text-muted mt-1">{t('subtitle')}</p>
        </div>
        <button className="text-sm gradient-text hover:opacity-80 transition-opacity cursor-pointer font-semibold">
          {t('viewAll')} →
        </button>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-text-muted">加载中...</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="text-center py-16">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* 空状态 */}
      {!loading && !error && !hasGenerations && (
        <div className="text-center py-16">
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
          <h3 className="text-lg font-semibold text-white mb-2">{t('empty.title')}</h3>
          <p className="text-text-muted mb-6">{t('empty.subtitle')}</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-bg text-white font-semibold transition-all hover:scale-105 cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div key={task.taskId} className="cursor-pointer">
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
                    {/* 任务状态 */}
                    {task.status === 'completed' && task.results && task.results.length > 0 ? (
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={task.results[0].url}
                          alt={task.parameters.prompt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : task.status === 'processing' || task.status === 'pending' ? (
                      <div className="aspect-square flex flex-col items-center justify-center bg-surface-secondary rounded-lg">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-text-muted text-sm">
                          {task.status === 'processing' ? '生成中...' : '排队中...'}
                        </p>
                        {task.progress > 0 && (
                          <p className="text-text-muted text-xs mt-1">{task.progress}%</p>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square flex flex-col items-center justify-center bg-surface-secondary rounded-lg">
                        <svg className="w-12 h-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-red-400 text-sm">生成失败</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 模型信息 */}
              <div>
                <span className="inline-flex items-center rounded border font-semibold transition-colors border-transparent px-1.5 py-0.5 text-xs bg-surface-secondary text-white tracking-wide hover:bg-bg-hover">
                  {task.model}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
