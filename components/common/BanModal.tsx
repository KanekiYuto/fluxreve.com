'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ShieldBan, X } from 'lucide-react';

interface BanModalProps {
  isOpen: boolean;
  bannedAt?: Date | string;
  reason?: string;
  onClose?: () => void;
}

/**
 * 封禁提示模态框组件
 * 用于向被封禁用户展示封禁信息
 */
export default function BanModal({ isOpen, bannedAt, reason, onClose }: BanModalProps) {
  const t = useTranslations('common.banModal');

  // 键盘事件处理 - ESC 关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !onClose) return;

      if (e.key === 'Escape') {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // 注册键盘事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 点击遮罩层关闭（如果提供了 onClose）
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  // 格式化封禁时间
  const formatBanTime = (date?: Date | string) => {
    if (!date) return '';

    const bannedDate = typeof date === 'string' ? new Date(date) : date;

    try {
      return bannedDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Failed to format ban time:', error);
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* 模态框主体 */}
      <div
        className="relative w-full max-w-md mx-4 bg-bg-elevated rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 - 仅在提供 onClose 时显示 */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 内容区域 */}
        <div className="p-8 text-center">
          {/* 警告图标 */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
            <ShieldBan className="w-10 h-10 text-red-500" />
          </div>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('title')}
          </h2>

          {/* 描述 */}
          <p className="text-text-muted mb-6 leading-relaxed">
            {t('description')}
          </p>

          {/* 封禁详情 */}
          <div className="space-y-3 mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
            {/* 封禁时间 */}
            {bannedAt && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-text-muted">{t('bannedTime')}</span>
                <span className="text-sm text-white font-medium">{formatBanTime(bannedAt)}</span>
              </div>
            )}

            {/* 封禁原因 */}
            {reason && (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-text-muted">{t('reason')}</span>
                <p className="text-sm text-white leading-relaxed">{reason}</p>
              </div>
            )}
          </div>

          {/* 联系信息 */}
          <p className="text-sm text-text-muted">
            {t('contact')}
          </p>
        </div>
      </div>
    </div>
  );
}
