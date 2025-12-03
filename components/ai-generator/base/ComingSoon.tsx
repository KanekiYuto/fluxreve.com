'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, Clock, Zap } from 'lucide-react';

interface ComingSoonProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

export default function ComingSoon({ icon, title, description }: ComingSoonProps) {
  const t = useTranslations('ai-generator.comingSoon');

  return (
    <div className="min-h-[600px] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* 主卡片 */}
        <div className="relative bg-gradient-to-br from-bg-elevated/80 to-bg-elevated/40 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* 内容 */}
          <div className="relative z-10 p-12 text-center">
            {/* 图标和徽章 - 上下布局 */}
            <div className="flex flex-col items-center mb-8">
              {/* 即将推出徽章 */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 mb-6">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">
                  {t('badge')}
                </span>
              </div>

              {/* 图标 */}
              <div className="relative inline-block">
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30 shadow-2xl shadow-primary/20">
                  {icon || (
                    <Sparkles className="w-12 h-12 text-primary" />
                  )}
                </div>
                {/* 浮动光点 */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-ping" />
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-secondary rounded-full animate-pulse" />
              </div>
            </div>

            {/* 标题 */}
            <h3 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {title || t('defaultTitle')}
            </h3>

            {/* 描述 */}
            <p className="text-lg text-text-muted max-w-lg mx-auto mb-10 leading-relaxed">
              {description || t('defaultDescription')}
            </p>

            {/* 功能亮点 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-bg-elevated/50 backdrop-blur-sm rounded-xl p-4 border border-border/30">
                <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-white mb-1">{t('feature1Title')}</p>
                <p className="text-xs text-text-muted">{t('feature1Desc')}</p>
              </div>
              <div className="bg-bg-elevated/50 backdrop-blur-sm rounded-xl p-4 border border-border/30">
                <Sparkles className="w-6 h-6 text-secondary mx-auto mb-2" />
                <p className="text-sm font-medium text-white mb-1">{t('feature2Title')}</p>
                <p className="text-xs text-text-muted">{t('feature2Desc')}</p>
              </div>
              <div className="bg-bg-elevated/50 backdrop-blur-sm rounded-xl p-4 border border-border/30">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-white mb-1">{t('feature3Title')}</p>
                <p className="text-xs text-text-muted">{t('feature3Desc')}</p>
              </div>
            </div>

            {/* 进度指示 */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-text-muted">{t('progressLabel')}</span>
                <span className="text-primary font-bold">75%</span>
              </div>
              <div className="h-2 rounded-full bg-bg-elevated/80 overflow-hidden border border-border/30">
                <div className="h-full w-3/4 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
              </div>
              <p className="text-xs text-text-muted mt-3">{t('progressHint')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
