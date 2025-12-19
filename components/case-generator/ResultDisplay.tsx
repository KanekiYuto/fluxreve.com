'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import useImagePreviewStore from '@/store/useImagePreviewStore';

interface ResultDisplayProps {
  beforeImage: string | null;
  afterImage: string | null;
  autoTransition?: boolean;
  transitionDelay?: number; // 自动过渡延迟（毫秒）
  scanDuration?: number; // 扫描动画持续时间（毫秒）
}

export default function ResultDisplay({
  beforeImage,
  afterImage,
  autoTransition = true,
  transitionDelay = 1000,
  scanDuration = 2000,
}: ResultDisplayProps) {
  const t = useTranslations('case-generator');
  const [scanProgress, setScanProgress] = useState(0);
  const { open: openPreview } = useImagePreviewStore();

  useEffect(() => {
    // 当图片更新时，重置进度
    setScanProgress(0);

    // 如果启用自动过渡，延迟后开始扫描
    if (autoTransition && beforeImage && afterImage) {
      const timer = setTimeout(() => {
        // 使用 CSS transition 实现平滑扫描
        setScanProgress(100);
      }, transitionDelay);

      return () => clearTimeout(timer);
    }
  }, [beforeImage, afterImage, autoTransition, transitionDelay]);

  if (!beforeImage) {
    return null;
  }

  // 当前显示的图片（扫描完成显示结果图，否则显示原图）
  const currentDisplayImage = scanProgress === 100 && afterImage ? afterImage : beforeImage;

  // 处理点击预览
  const handlePreview = () => {
    if (currentDisplayImage) {
      openPreview([currentDisplayImage], 0);
    }
  };

  return (
    <>
      <div
        className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/5 self-start bg-surface-secondary/20 cursor-pointer group"
        onClick={handlePreview}
      >
        <div className="relative w-full aspect-[4/3]">
          {/* 原图 - 底层 */}
          <div className="absolute inset-0">
            <img
              src={beforeImage}
              alt="原图"
              className="w-full h-full object-contain"
            />
          </div>

          {/* 结果图 - 通过 clip-path 扫描显示 */}
          {afterImage && (
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 transition-all ease-in-out"
                style={{
                  clipPath: `inset(0 ${100 - scanProgress}% 0 0)`,
                  transitionDuration: `${scanDuration}ms`,
                }}
              >
                <img
                  src={afterImage}
                  alt="生成结果"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 扫描线效果 */}
              {scanProgress > 0 && scanProgress < 100 && (
                <div
                  className="absolute top-0 bottom-0 w-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(139,92,246,0.8)] transition-all ease-in-out"
                  style={{
                    left: `${scanProgress}%`,
                    transitionDuration: `${scanDuration}ms`,
                  }}
                />
              )}
            </div>
          )}

          {/* 悬停提示 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
              <span className="text-sm font-medium text-white">{t('clickToPreview')}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
