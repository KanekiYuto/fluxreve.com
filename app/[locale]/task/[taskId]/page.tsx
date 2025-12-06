'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { getModelDisplayName } from '@/config/model-names';
import { getTaskDuration, formatDuration } from '@/lib/utils';
import ImageCarousel from './components/ImageCarousel';
import InfoCard from './components/InfoCard';
import PromptCard from './components/PromptCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import NotFoundView from './components/NotFoundView';
import ProcessingView from './components/ProcessingView';
import ActionButtons from './components/ActionButtons';

interface TaskResult {
  url: string;
  type?: string;
  width?: number;
  height?: number;
}

interface TaskData {
  taskId: string;
  shareId: string;
  taskType: string;
  provider: string;
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  parameters?: {
    prompt?: string;
    resolution?: string;
    aspect_ratio?: string;
    output_format?: string;
    seed?: string;
    steps?: number;
    size?: string;
  };
  results?: TaskResult[];
  errorMessage?: string | null;
  createdAt: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number | null;
  quotaConsumed?: number | null;
  isPrivate?: boolean;
  isNsfw?: boolean;
}

export default function TaskDetailsPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const t = useTranslations('task.details');

  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchTask() {
      try {
        const response = await fetch(`/api/ai-generator/tasks/${taskId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.success) {
          setTask(data.data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to fetch task:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  // 加载中状态
  if (loading) {
    return <LoadingSkeleton />;
  }

  // 任务不存在
  if (notFound || !task) {
    return <NotFoundView />;
  }

  // 任务未完成（排除 completed 状态）
  if (task.status === 'pending' || task.status === 'processing' || task.status === 'failed') {
    return <ProcessingView status={task.status} />;
  }

  // 任务已完成但缺少必要数据
  if (!task.results || !task.completedAt) {
    return <ProcessingView status="failed" />;
  }

  // 提取数据
  const prompt = task.parameters?.prompt || '';
  const model = getModelDisplayName(task.model || 'Unknown Model');
  const resolution = task.parameters?.resolution;
  const aspectRatio = task.parameters?.aspect_ratio;
  const seed = task.parameters?.seed;
  const size = task.parameters?.size;

  // 计算生成耗时
  const durationMs = getTaskDuration({
    durationMs: task.durationMs,
    startedAt: task.startedAt ? new Date(task.startedAt) : null,
    completedAt: task.completedAt ? new Date(task.completedAt) : null,
  });

  const durationText = formatDuration(durationMs);

  // 格式化时间
  const createdTime = format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm:ss');
  const completedTime = task.completedAt ? format(new Date(task.completedAt), 'yyyy-MM-dd HH:mm:ss') : null;

  return (
    <div className="min-h-screen bg-bg">
      {/* 页面标题 */}
      <header className="bg-bg-elevated border-b border-border">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('generationResults')}</h1>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span>{model}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={task.completedAt}>
              {format(new Date(task.completedAt), 'yyyy-MM-dd HH:mm:ss')}
            </time>
          </div>
        </div>
      </header>

      <article className="py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* 主内容区域：图片和信息左右布局 */}
          <section className="bg-surface-secondary rounded-2xl p-4 border border-border/50 mb-8">
            <h2 className="sr-only">{model} {t('generationResults')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：图片轮播 */}
              <div className="lg:col-span-2">
                <h3 className="sr-only">{t('imagePreview')}</h3>
                <ImageCarousel images={task.results} prompt={prompt} />
              </div>

              {/* 右侧：信息区域 */}
              <aside className="lg:col-span-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="sr-only">{t('parametersInfo')}</h3>
                  {/* 详细信息网格 */}
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard label={t('aiModel')} value={model} fullWidth />
                    <InfoCard label={t('duration')} value={durationText} />
                    <InfoCard label={t('quotaConsumed')} value={String(task.quotaConsumed)} />
                    <PromptCard prompt={prompt} />
                    {size && <InfoCard label={t('size')} value={size} />}
                    {resolution && <InfoCard label={t('resolution')} value={resolution.toUpperCase()} />}
                    {aspectRatio && <InfoCard label={t('aspectRatio')} value={aspectRatio} />}
                    {seed && <InfoCard label={t('seed')} value={seed} />}
                    <InfoCard label={t('isPrivate')} value={task.isPrivate ? t('yes') : t('no')} />
                    <InfoCard label={t('isNsfw')} value={task.isNsfw ? t('yes') : t('no')} />
                    <InfoCard label={t('createdAt')} value={createdTime} fullWidth />
                    {completedTime && <InfoCard label={t('completedAt')} value={completedTime} fullWidth />}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className='mt-6'>
                  <ActionButtons
                    shareId={task.shareId}
                    imageUrl={task.results?.[0]?.url}
                    allImages={task.results?.map(r => r.url)}
                    isPrivate={task.isPrivate}
                  />
                </div>
              </aside>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
