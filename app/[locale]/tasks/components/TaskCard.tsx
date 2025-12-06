'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { getModelDisplayName } from '@/config/model-names';
import { GenerationTask } from './TaskList';

interface TaskCardProps {
  task: GenerationTask;
  onDelete?: (taskId: string) => void;
}

// 使用浏览器原生 API 计算相对时间
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  
  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const t = useTranslations('tasks');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/ai-generator/tasks/${task.taskId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        onDelete?.(task.taskId);
      } else {
        console.error('Failed to delete task:', data.error);
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      setShowConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const timeAgo = getTimeAgo(new Date(task.createdAt));
  const hasImage = task.results && task.results.length > 0 && task.status === 'completed';

  return (
    <Link href={`/task/${task.taskId}`} className="block group">
      <div className="relative rounded-xl overflow-hidden bg-surface-secondary border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        {/* 图片区域 */}
        <div className="relative aspect-square bg-bg-elevated overflow-hidden">
          {hasImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={task.results![0].url}
                alt={task.parameters.prompt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* 多图标识 */}
              {task.results!.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{task.results!.length}</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {task.status === 'processing' ? (
                <div className="text-center">
                  <svg className="w-12 h-12 text-primary animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs text-text-muted">{task.progress}%</span>
                </div>
              ) : task.status === 'pending' ? (
                <div className="text-center">
                  <svg className="w-12 h-12 text-yellow-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-text-muted">{t('status.pending')}</span>
                </div>
              ) : task.status === 'failed' ? (
                <div className="text-center">
                  <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-xs text-red-400">{t('status.failed')}</span>
                </div>
              ) : (
                <svg className="w-12 h-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
          )}

          {/* 删除按钮 - 悬停时显示 */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {showConfirm ? (
              <div className="flex gap-1">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title={t('card.confirmDelete')}
                >
                  {isDeleting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
                  title={t('card.cancelDelete')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleDelete}
                className="p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
                title={t('card.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 信息区域 */}
        <div className="p-3 sm:p-4">
          {/* 状态和模型 */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
              {getStatusIcon(task.status)}
              {t(`status.${task.status}`)}
            </span>
            <span className="text-xs text-text-muted truncate">
              {getModelDisplayName(task.model)}
            </span>
          </div>

          {/* 提示词 */}
          <p className="text-sm text-white line-clamp-2 mb-2 min-h-[2.5rem]">
            {task.parameters.prompt || t('noPrompt')}
          </p>

          {/* 时间 */}
          <p className="text-xs text-text-muted">
            {timeAgo}
          </p>
        </div>
      </div>
    </Link>
  );
}
