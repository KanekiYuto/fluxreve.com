'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import WaterfallGrid from './WaterfallGrid';
import ExploreCard from './ExploreCard';
import ExploreLoadingSkeleton from './ExploreLoadingSkeleton';
import ExploreEmptyState from './ExploreEmptyState';
import Pagination from '@/app/[locale]/tasks/components/Pagination';
import ModelFilter from './ModelFilter';
import { ExploreTask, ExplorePagination, ExploreResponse } from '../types';

interface ExploreGalleryProps {
  model?: string;
}

export default function ExploreGallery({ model }: ExploreGalleryProps) {
  const t = useTranslations('explore');
  const [tasks, setTasks] = useState<ExploreTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ExplorePagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTasks = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '24');

      // 如果指定了模型，添加到查询参数
      if (model) {
        params.set('model', model);
      }

      const response = await fetch(`/api/explore?${params.toString()}`);
      const data: ExploreResponse = await response.json();

      if (data.success) {
        setTasks(data.data || []);
        setPagination(data.pagination || null);
      } else {
        setError(data.error || t('errors.fetchFailed'));
      }
    } catch (err) {
      console.error('[Explore] Failed to fetch tasks:', err);
      setError(t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [t, model]);

  useEffect(() => {
    fetchTasks(currentPage);
  }, [currentPage, fetchTasks]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 页面头部 */}
      <div className="bg-bg-elevated border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
            {model ? `${model} - ${t('header.title')}` : t('header.title')}
          </h1>
          <p className="text-text-muted text-base sm:text-lg mb-6">{t('header.subtitle')}</p>

          {/* 模型筛选器 */}
          <ModelFilter currentModel={model} />
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 加载状态 */}
        {loading && <ExploreLoadingSkeleton />}

        {/* 错误状态 */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-text-muted mb-4">{error}</p>
            <button
              onClick={() => fetchTasks(currentPage)}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              {t('errors.retry')}
            </button>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && tasks.length === 0 && <ExploreEmptyState />}

        {/* 瀑布流网格 */}
        {!loading && !error && tasks.length > 0 && (
          <>
            <WaterfallGrid>
              {tasks.map((task) => (
                <ExploreCard key={task.taskId} task={task} />
              ))}
            </WaterfallGrid>

            {/* 分页控制 */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
