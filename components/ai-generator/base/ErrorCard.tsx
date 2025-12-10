'use client';

import { useTranslations } from 'next-intl';
import useModalStore from '@/store/useModalStore';

interface ErrorCardProps {
  /**
   * 错误标题
   */
  title: string;
  /**
   * 错误消息
   */
  message: string;
  /**
   * 错误类型，影响样式
   */
  variant?: 'error' | 'warning' | 'credits';
  /**
   * 积分信息（仅当 variant='credits' 时使用）
   */
  creditsInfo?: {
    required: number;
    current: number;
  };
}

export default function ErrorCard({
  title,
  message,
  variant = 'error',
  creditsInfo,
}: ErrorCardProps) {
  const t = useTranslations('ai-generator.error');
  const { openSubscriptionModal } = useModalStore();
  // 根据类型确定颜色
  const colorClasses = {
    error: {
      containerBg: 'bg-gradient-to-br from-red-500/5 via-red-500/3 to-transparent',
      border: 'border-red-500/20',
      iconContainerBg: 'bg-gradient-to-br from-red-500/15 to-red-500/5',
      iconRing: 'ring-2 ring-red-500/20',
      icon: 'text-red-500',
      title: 'text-red-500',
      message: 'text-foreground/70',
      accentLine: 'bg-gradient-to-r from-transparent via-red-500/30 to-transparent',
    },
    warning: {
      containerBg: 'bg-gradient-to-br from-yellow-500/5 via-yellow-500/3 to-transparent',
      border: 'border-yellow-500/20',
      iconContainerBg: 'bg-gradient-to-br from-yellow-500/15 to-yellow-500/5',
      iconRing: 'ring-2 ring-yellow-500/20',
      icon: 'text-yellow-500',
      title: 'text-yellow-500',
      message: 'text-foreground/70',
      accentLine: 'bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent',
    },
    credits: {
      containerBg: 'bg-gradient-to-br from-orange-500/5 via-orange-500/3 to-transparent',
      border: 'border-orange-500/20',
      iconContainerBg: 'bg-gradient-to-br from-orange-500/15 to-orange-500/5',
      iconRing: 'ring-2 ring-orange-500/20',
      icon: 'text-orange-500',
      title: 'text-orange-500',
      message: 'text-foreground/70',
      accentLine: 'bg-gradient-to-r from-transparent via-orange-500/30 to-transparent',
    },
  };

  const colors = colorClasses[variant];

  return (
    <div className={`relative rounded-2xl border ${colors.border} ${colors.containerBg} backdrop-blur-sm overflow-hidden`}>
      {/* 装饰性顶部线条 */}
      <div className={`h-px w-full ${colors.accentLine}`} />

      <div className="p-8">
        <div className="flex flex-col items-center text-center space-y-5">
          {/* 错误图标 */}
          <div className={`relative flex-shrink-0 rounded-full ${colors.iconContainerBg} ${colors.iconRing} p-4 shadow-lg`}>
            {variant === 'credits' ? (
              <svg
                className={`w-10 h-10 ${colors.icon}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            ) : variant === 'error' ? (
              <svg
                className={`w-10 h-10 ${colors.icon}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg
                className={`w-10 h-10 ${colors.icon}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}

            {/* 图标光晕效果 */}
            <div className={`absolute inset-0 rounded-full ${colors.iconContainerBg} blur-xl opacity-50`} />
          </div>

          {/* 错误内容 */}
          <div className="space-y-3 max-w-lg">
            <h3 className={`text-xl font-bold ${colors.title} tracking-tight`}>
              {title}
            </h3>
            <div className={`h-px w-16 mx-auto ${colors.accentLine}`} />

            {/* 积分对比显示 */}
            {variant === 'credits' && creditsInfo ? (
              <div className="space-y-4 px-4">
                <div className="flex items-center justify-center gap-6">
                  {/* 需要的积分 */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-foreground/50 mb-1">{t('required')}</span>
                    <div className={`text-3xl font-bold ${colors.title}`}>
                      {creditsInfo.required}
                    </div>
                    <span className="text-xs text-foreground/50 mt-1">{t('credits')}</span>
                  </div>

                  {/* 分隔符 */}
                  <div className="text-2xl text-foreground/30 font-light">/</div>

                  {/* 当前积分 */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-foreground/50 mb-1">{t('current')}</span>
                    <div className="text-3xl font-bold text-foreground/40">
                      {creditsInfo.current}
                    </div>
                    <span className="text-xs text-foreground/50 mt-1">{t('credits')}</span>
                  </div>
                </div>

                <p className={`text-sm ${colors.message} leading-relaxed`}>
                  {message}
                </p>

                {/* 订阅按钮 */}
                <button
                  onClick={openSubscriptionModal}
                  className="mt-2 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t('subscribe')}
                </button>
              </div>
            ) : (
              <p className={`text-base ${colors.message} break-words leading-relaxed px-4`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 装饰性底部线条 */}
      <div className={`h-px w-full ${colors.accentLine}`} />
    </div>
  );
}
