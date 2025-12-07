'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import useImagePreviewStore from '@/store/useImagePreviewStore';

interface ImageCarouselProps {
  images: Array<{
    url: string;
    type: string;
  }>;
  prompt: string;
  isNsfw?: boolean;
  parameters?: {
    images?: string[];
    [key: string]: any;
  };
  onNsfwReveal?: () => void;
}

export default function ImageCarousel({ images, prompt, isNsfw = false, parameters, onNsfwReveal }: ImageCarouselProps) {
  const t = useTranslations('share.details');
  const tNsfw = useTranslations('share.nsfw');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nsfwRevealed, setNsfwRevealed] = useState(false);
  const openPreview = useImagePreviewStore((state) => state.open);

  // 获取参考图片数组
  const referenceImages = parameters?.images || [];

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  // 键盘事件监听
  useEffect(() => {
    if (images.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, goToPrevious, goToNext]);

  if (images.length === 0) {
    return null;
  }

  // 是否显示 NSFW 遮罩
  const showNsfwOverlay = isNsfw && !nsfwRevealed;

  // SEO 友好的 alt 文本：NSFW 内容使用通用描述
  const getImageAlt = () => {
    if (isNsfw) {
      return tNsfw('imageAlt'); // 通用的"AI生成图像"描述
    }
    return `${prompt} - ${t('imageAlt')} ${currentIndex + 1}`;
  };

  // 打开图片预览
  const handleImageClick = () => {
    if (showNsfwOverlay) return;
    const imageUrls = images.map((img) => img.url);
    openPreview(imageUrls, currentIndex);
  };

  // 打开参考图片预览
  const handleReferenceImageClick = (index: number) => {
    if (showNsfwOverlay) return;
    openPreview(referenceImages, index);
  };

  return (
    <div className="relative bg-surface-secondary rounded-2xl overflow-hidden border border-border/50">
      {/* 主图片区域 */}
      <div className="relative w-full aspect-square bg-muted group overflow-hidden">
        {/* 可点击的图片容器 */}
        <button
          type="button"
          onClick={handleImageClick}
          disabled={showNsfwOverlay}
          className={`relative w-full h-full block overflow-hidden ${
            showNsfwOverlay ? '' : 'cursor-pointer'
          }`}
          aria-label={t('imagePreview')}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[currentIndex].url}
            alt={getImageAlt()}
            className={`w-full h-full object-contain transition-all duration-300 ${
              showNsfwOverlay ? 'blur-xl scale-105' : 'group-hover:scale-[1.02]'
            }`}
            loading="eager"
            // NSFW 内容阻止搜索引擎索引图片
            {...(isNsfw && { 'data-nosnippet': 'true' })}
          />

          {/* 悬停时显示放大图标 */}
          {!showNsfwOverlay && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          )}
        </button>

        {/* NSFW 遮罩层 */}
        {showNsfwOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            {/* 警告图标 */}
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            {/* 警告文本 */}
            <h3 className="text-white text-lg font-semibold mb-2">
              {tNsfw('warning')}
            </h3>
            <p className="text-white/70 text-sm text-center max-w-xs mb-6 px-4">
              {tNsfw('description')}
            </p>
            
            {/* 查看按钮 */}
            <button
              onClick={() => {
                setNsfwRevealed(true);
                onNsfwReveal?.();
              }}
              className="relative overflow-hidden px-6 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 cursor-pointer bg-white text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300"
            >
              {tNsfw('reveal')}
            </button>
          </div>
        )}

        {/* 图片计数器 */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm font-medium z-20">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* 左右切换按钮 - 仅在非遮罩状态显示 */}
        {images.length > 1 && !showNsfwOverlay && (
          <>
            {/* 左箭头 */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white transition-all flex items-center justify-center group cursor-pointer"
              aria-label={t('previousImage')}
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 右箭头 */}
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white transition-all flex items-center justify-center group cursor-pointer"
              aria-label={t('nextImage')}
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* 参考图片缩略图区域 */}
      {referenceImages.length > 0 && !showNsfwOverlay && (
        <div className="relative z-10 px-4 py-3 border-t border-border/50 bg-background">
          <h4 className="text-sm font-medium text-foreground/70 mb-2">
            {t('referenceImages')}
          </h4>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {referenceImages.map((imageUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleReferenceImageClick(index)}
                className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all cursor-pointer group bg-muted"
                aria-label={`${t('referenceImage')} ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`${t('referenceImage')} ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

