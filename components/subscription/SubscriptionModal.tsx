'use client';

import Pricing from '@/components/pricing';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {

  // 点击遮罩层关闭
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 按 ESC 键关闭
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto py-8"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="订阅方案"
    >
      <div className="relative w-full max-w-7xl mx-4 bg-bg-elevated rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-text-muted hover:text-text hover:bg-bg-hover rounded-lg transition-colors"
          aria-label="关闭"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 模态框内容 */}
        <div className="p-4 md:p-8 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-dark">
          <Pricing useH1={false} />
        </div>
      </div>
    </div>
  );
}
