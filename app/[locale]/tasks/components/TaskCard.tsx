'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Trash2, Lock, Unlock } from 'lucide-react';
import { getModelDisplayName } from '@/config/model-names';
import useModalStore from '@/store/useModalStore';
import useUserStore from '@/store/useUserStore';
import { GenerationTask } from './TaskList';

interface TaskCardProps {
  task: GenerationTask;
  onDelete?: (taskId: string) => void;
  onTogglePrivacy?: (taskId: string, isPrivate: boolean) => void;
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

export default function TaskCard({ task, onDelete, onTogglePrivacy }: TaskCardProps) {
  const t = useTranslations('tasks');
  const tForm = useTranslations('ai-generator.form');
  const user = useUserStore((state) => state.user);
  const { openSubscriptionModal } = useModalStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTogglingPrivacy, setIsTogglingPrivacy] = useState(false);
  const [isPrivate, setIsPrivate] = useState(task.isPrivate);

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
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
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };

  const handleTogglePrivacy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 检查是否为免费用户，且尝试设为私人
    if (!isPrivate && user && user.userType === 'free') {
      openSubscriptionModal();
      return;
    }

    setIsTogglingPrivacy(true);
    const newPrivateState = !isPrivate;

    try {
      const response = await fetch(`/api/ai-generator/tasks/${task.taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPrivate: newPrivateState }),
      });
      const data = await response.json();

      if (data.success) {
        setIsPrivate(newPrivateState);
        onTogglePrivacy?.(task.taskId, newPrivateState);
      } else {
        console.error('Failed to toggle privacy:', data.error);
      }
    } catch (error) {
      console.error('Failed to toggle privacy:', error);
    } finally {
      setIsTogglingPrivacy(false);
    }
  };

  const timeAgo = getTimeAgo(new Date(task.createdAt));
  const hasImage = task.results && task.results.length > 0 && task.status === 'completed';

  return (
    <>
      <div className="relative rounded-xl overflow-hidden bg-surface-secondary border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        {/* 图片区域 - 可点击跳转 */}
        <Link href={`/task/${task.taskId}`} className="block group">
          <div className="relative aspect-square bg-bg-elevated overflow-hidden">
            {hasImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={task.results![0].url}
                  alt={task.parameters.prompt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* 私有状态标识 */}
                {isPrivate && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-yellow-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>{t('card.private')}</span>
                  </div>
                )}
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
          </div>
        </Link>

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
          <Link href={`/task/${task.taskId}`}>
            <p className="text-sm text-white line-clamp-2 mb-2 min-h-[2.5rem] hover:text-primary transition-colors cursor-pointer">
              {task.parameters.prompt || t('noPrompt')}
            </p>
          </Link>

          {/* 时间和操作按钮 */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              {timeAgo}
            </p>
            <div className="flex items-center gap-1">
              {/* 私有状态切换按钮 */}
              <button
                onClick={handleTogglePrivacy}
                disabled={isTogglingPrivacy}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isPrivate
                    ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10'
                    : 'text-text-muted hover:text-green-400 hover:bg-green-500/10'
                } disabled:opacity-50`}
                title={!isPrivate && user?.userType === 'free'
                  ? tForm('privateModeSubscriptionRequired')
                  : isPrivate ? t('card.makePublic') : t('card.makePrivate')
                }
              >
                {isTogglingPrivacy ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : isPrivate ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
              </button>
              {/* 删除按钮 */}
              <button
                onClick={handleDeleteClick}
                className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title={t('card.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleCancelDelete}
        >
          <div 
            className="bg-bg-elevated border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t('card.confirmDeleteTitle')}
              </h3>
              <p className="text-sm text-text-muted">
                {t('card.confirmDeleteMessage')}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-surface-secondary hover:bg-bg-hover border border-border rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('card.cancelDelete')}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{t('card.deleting')}</span>
                  </>
                ) : (
                  t('card.confirmDelete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
