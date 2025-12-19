'use client';

import { useTranslations } from 'next-intl';

interface GeneratingAnimationProps {
  progress?: number; // 0-100
}

export default function GeneratingAnimation({ progress = 0 }: GeneratingAnimationProps) {
  const t = useTranslations('case-generator');

  return (
    <div className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-surface-secondary/20 border border-white/5 self-start">
      <div className="relative w-full aspect-[4/3] flex items-center justify-center">
        {/* 背景渐变动画 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10 animate-pulse" />

        {/* 中心内容 */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* 文字提示 */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-white">{t('generatingTitle')}</h3>
            <p className="text-sm text-white/60">{t('generatingSubtitle')}</p>
          </div>

          {/* 进度条 */}
          {progress > 0 && (
            <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
