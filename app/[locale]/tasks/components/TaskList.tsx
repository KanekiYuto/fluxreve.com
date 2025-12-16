'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import TaskCard from './TaskCard';
import TaskListSkeleton from './TaskListSkeleton';
import TaskEmptyState from './TaskEmptyState';
import TaskFilters, { StatusFilter, TaskTypeFilter, ModelFilter, PrivacyFilter, NsfwFilter } from './TaskFilters';
import Pagination from './Pagination';

// 任务接口定义
export interface GenerationTask {
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
  errorMessage?: string | null;
  isPrivate: boolean;
  isNsfw: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Filters {
  statuses: StatusFilter[];
  taskTypes: TaskTypeFilter[];
  models: ModelFilter[];
  privacy: PrivacyFilter[];
  nsfw: NsfwFilter[];
}

export default function TaskList() {
  const t = useTranslations('tasks');
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    statuses: [],
    taskTypes: [],
    models: [],
    privacy: [],
    nsfw: [],
  });

  const fetchTasks = useCallback(async (page: number, currentFilters: Filters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      
      // 多选：用逗号分隔
      if (currentFilters.statuses.length > 0) {
        params.set('status', currentFilters.statuses.join(','));
      }
      if (currentFilters.taskTypes.length > 0) {
        params.set('taskType', currentFilters.taskTypes.join(','));
      }
      if (currentFilters.models.length > 0) {
        params.set('model', currentFilters.models.join(','));
      }
      if (currentFilters.privacy.length > 0) {
        params.set('privacy', currentFilters.privacy.join(','));
      }
      if (currentFilters.nsfw.length > 0) {
        params.set('nsfw', currentFilters.nsfw.join(','));
      }

      const response = await fetch(`/api/ai-generator/tasks?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTasks(data.data || []);
        setPagination(data.pagination);
      } else {
        setError(data.error || t('errors.fetchFailed'));
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTasks(currentPage, filters);
  }, [currentPage, filters, fetchTasks]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = (statuses: StatusFilter[]) => {
    setFilters(prev => ({ ...prev, statuses }));
    setCurrentPage(1);
  };

  const handleTaskTypeChange = (taskTypes: TaskTypeFilter[]) => {
    setFilters(prev => ({ ...prev, taskTypes }));
    setCurrentPage(1);
  };

  const handleModelChange = (models: ModelFilter[]) => {
    setFilters(prev => ({ ...prev, models }));
    setCurrentPage(1);
  };

  const handlePrivacyChange = (privacy: PrivacyFilter[]) => {
    setFilters(prev => ({ ...prev, privacy }));
    setCurrentPage(1);
  };

  const handleNsfwChange = (nsfw: NsfwFilter[]) => {
    setFilters(prev => ({ ...prev, nsfw }));
    setCurrentPage(1);
  };

  const hasFilters = filters.statuses.length > 0 || filters.taskTypes.length > 0 || filters.models.length > 0 || filters.privacy.length > 0 || filters.nsfw.length > 0;

  const handleDeleteTask = async (taskId: string) => {
    // 删除成功后重新拉取当前页数据，确保分页信息准确
    await fetchTasks(currentPage, filters);
  };

  const handleTogglePrivacy = async (taskId: string, isPrivate: boolean) => {
    // 更新成功后重新拉取当前页数据，确保数据一致性
    await fetchTasks(currentPage, filters);
  };

  return (
    <div>
      {/* 筛选条件 */}
      <div className="mb-6">
        <TaskFilters
          selectedStatuses={filters.statuses}
          selectedTaskTypes={filters.taskTypes}
          selectedModels={filters.models}
          selectedPrivacy={filters.privacy}
          selectedNsfw={filters.nsfw}
          onStatusChange={handleStatusChange}
          onTaskTypeChange={handleTaskTypeChange}
          onModelChange={handleModelChange}
          onPrivacyChange={handlePrivacyChange}
          onNsfwChange={handleNsfwChange}
        />
      </div>

      {/* 加载状态 */}
      {loading && <TaskListSkeleton />}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="text-center py-12 sm:py-16">
          <p className="text-sm sm:text-base text-red-400">{error}</p>
          <button
            onClick={() => fetchTasks(currentPage, filters)}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/80 transition-colors"
          >
            {t('errors.retry')}
          </button>
        </div>
      )}

      {/* 空状态 */}
      {!loading && !error && tasks.length === 0 && (
        <TaskEmptyState hasFilters={hasFilters} />
      )}

      {/* 任务列表 */}
      {!loading && !error && tasks.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {tasks.map((task) => (
              <TaskCard 
                key={task.taskId} 
                task={task} 
                onDelete={handleDeleteTask}
                onTogglePrivacy={handleTogglePrivacy}
              />
            ))}
          </div>

          {/* 分页 */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8">
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
  );
}
