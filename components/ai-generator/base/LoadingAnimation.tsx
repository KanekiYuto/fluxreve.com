'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface LoadingAnimationProps {
  progress?: number;
}

export default function LoadingAnimation({ progress = 0 }: LoadingAnimationProps) {
  const t = useTranslations('ai-generator.loading');
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 初始化阶段：模拟 0-15% 的快速进度
    if (progress === 0 && isInitializing) {
      let currentProgress = 0;
      const initInterval = setInterval(() => {
        currentProgress += Math.random() * 3; // 随机增长 0-3%
        if (currentProgress >= 15) {
          currentProgress = 15;
          clearInterval(initInterval);
        }
        setDisplayProgress(Math.floor(currentProgress));
      }, 200); // 每 200ms 更新一次

      return () => clearInterval(initInterval);
    }

    // 真实进度接管：当服务器返回真实进度时
    if (progress > 0) {
      setIsInitializing(false);

      // 丝滑过渡到真实进度
      if (progress > displayProgress) {
        // 使用动画逐步追上真实进度
        const diff = progress - displayProgress;
        const step = diff / 10; // 分 10 步追上

        let current = displayProgress;
        const catchUpInterval = setInterval(() => {
          current += step;
          if (current >= progress) {
            current = progress;
            clearInterval(catchUpInterval);
          }
          setDisplayProgress(Math.floor(current));
        }, 50); // 每 50ms 更新一次，总共 500ms 追上

        return () => clearInterval(catchUpInterval);
      } else {
        // 如果真实进度小于显示进度（不应该发生），直接设置
        setDisplayProgress(progress);
      }
    }
  }, [progress, displayProgress, isInitializing]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-10 py-20 min-h-[500px]">
      {/* 主视觉：闪电图标 + 光环 */}
      <div className="relative z-10">
        {/* 旋转光环 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-36 h-36 rounded-full border-2 border-transparent bg-gradient-to-r from-[#FF3466] via-[#C721FF] to-[#FF3466] animate-spin p-[3px]" style={{ animationDuration: '3s' }}>
            <div className="w-full h-full rounded-full bg-bg-elevated"></div>
          </div>
        </div>

        {/* 中心内容容器 */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* 闪电图标 */}
          <svg
            className="w-14 h-14 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* 装饰光点 - 增大并调整位置 */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#FF3466] rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#C721FF] rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#FF3466] rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#C721FF] rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '1.5s' }}></div>
      </div>

      {/* 进度信息 */}
      <div className="relative z-10 text-center space-y-5">
        {/* 进度百分比 */}
        <div>
          <p className="text-5xl font-bold gradient-text mb-2 transition-all duration-300">
            {displayProgress}%
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            {isInitializing ? t('initializing') : t('creating')}
          </p>
        </div>

        {/* 进度条 */}
        <div className="w-80">
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#FF3466] to-[#C721FF] transition-all duration-300 ease-out rounded-full relative overflow-hidden shadow-lg"
              style={{ width: `${displayProgress}%` }}
            >
              {/* 流动光效 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>

        {/* 提示文字 */}
        <p className="text-sm text-muted-foreground/90">{t('message')}</p>
      </div>

      {/* 添加流动光效的 keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          to {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
