'use client';

import { useTranslations } from 'next-intl';

interface NsfwConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function NsfwConfirmModal({ onConfirm, onCancel }: NsfwConfirmModalProps) {
  const t = useTranslations('explore');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-secondary rounded-2xl p-6 sm:p-8 max-w-md w-full border border-border">
        {/* 警告图标 */}
        <div className="flex justify-center mb-4">
          <svg className="w-16 h-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4v2m0 4v2m10.873-6.27l-2.268 7.684a2 2 0 01-1.897 1.517H5.292a2 2 0 01-1.897-1.517L1.03 9.73M12 1l11 20H1L12 1z"
            />
          </svg>
        </div>

        {/* 标题和描述 */}
        <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">{t('nsfw.warning')}</h3>
        <p className="text-text-muted text-center mb-6 text-sm sm:text-base leading-relaxed">
          {t('nsfw.description')}
        </p>

        {/* 按钮组 */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-surface-secondary border border-border rounded-lg text-white font-semibold hover:bg-border/20 transition-colors"
          >
            {t('nsfw.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            {t('nsfw.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
